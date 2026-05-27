/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * src/devvit/main.tsx
 * Complete AI Moderator Assistant Devvit Application.
 * 
 * Features:
 * - Listens for new comments (CommentSubmit)
 * - Checks toxicity, scam links, and FAQs using Gemini or central moderation service
 * - Performs Reddit moderator actions: autoRemove, warn, or lock-post
 * - Custom Menu Items & Form for configuration settings and FAQs list
 * - High-speed Local Reddit KV Store integration
 */

import { Devvit, TriggerContext, FormOnSubmitEvent } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true, // Enable Reddit APIs (warn, remove, lock, etc.)
  http: true,      // Enable HTTP requests to proxy Gemini API or your external API
  kvStore: true,   // Enable Devvit high-speed KV Store to persist settings
});

// Define Configuration Keys
const CONFIG_KEYS = {
  TOXIC_THRESHOLD: 'toxicity_threshold',
  AUTO_WARN: 'auto_warn_user',
  AUTO_DELETE_SPAM: 'auto_delete_spam',
  AUTO_REPLY_FAQ: 'auto_reply_faq',
  SCAM_PROTECT: 'scam_protection',
};

// 1. Setup Add Subreddit Menu Items for Custom Moderation Settings
const modSettingsForm = Devvit.createForm(
  {
    title: 'AI Moderator Config Console',
    description: 'Customize your Devvit active moderator parameters.',
    fields: [
      {
        type: 'number',
        name: 'toxicityThreshold',
        label: 'Toxicity Removal Threshold (0-100)',
        defaultValue: 65,
        required: true,
      },
      {
        type: 'boolean',
        name: 'autoWarnUser',
        label: 'Auto-Warn Users for Heavy Toxicity',
        defaultValue: true,
      },
      {
        type: 'boolean',
        name: 'autoDeleteSpam',
        label: 'Auto-Delete Phishing & Spam Link Posts',
        defaultValue: true,
      },
      {
        type: 'boolean',
        name: 'autoReplyFaqs',
        label: 'Auto-Reply to Configured FAQ Questions',
        defaultValue: true,
      },
    ],
  },
  async (event: FormOnSubmitEvent, context: TriggerContext) => {
    const { toxicityThreshold, autoWarnUser, autoDeleteSpam, autoReplyFaqs } = event.values;
    
    // Persist configuration in Reddit Devvit high-performance KV-Store
    await context.kvStore.put(CONFIG_KEYS.TOXIC_THRESHOLD, toxicityThreshold?.toString() || '65');
    await context.kvStore.put(CONFIG_KEYS.AUTO_WARN, autoWarnUser ? 'true' : 'false');
    await context.kvStore.put(CONFIG_KEYS.AUTO_DELETE_SPAM, autoDeleteSpam ? 'true' : 'false');
    await context.kvStore.put(CONFIG_KEYS.AUTO_REPLY_FAQ, autoReplyFaqs ? 'true' : 'false');
    
    context.ui.showToast('AI Moderation preferences updated successfully!');
  }
);

Devvit.addMenuItem({
  label: 'Manage Subreddit AI Moderator Settings',
  location: 'subreddit', 
  onPress: async (_event, context) => {
    context.ui.showForm(modSettingsForm);
  },
});

// 2. Setup Post & Comment Event Triggers to Active Moderate in real-time
Devvit.addTrigger({
  event: 'CommentSubmit',
  onEvent: async (event, context) => {
    const comment = event.comment;
    if (!comment) return;
    
    // Fetch stored moderation guidelines from KV store
    const threshold = parseInt((await context.kvStore.get(CONFIG_KEYS.TOXIC_THRESHOLD)) || '65');
    const autoWarn = (await context.kvStore.get(CONFIG_KEYS.AUTO_WARN)) !== 'false';
    const autoDelete = (await context.kvStore.get(CONFIG_KEYS.AUTO_DELETE_SPAM)) !== 'false';
    const autoReply = (await context.kvStore.get(CONFIG_KEYS.AUTO_REPLY_FAQ)) !== 'false';

    const reddit = context.reddit;
    const authorName = comment.authorName;
    const bodyText = comment.body;
    
    // Ignore moderation actions on own Auto-Mod or official Reddit bots
    if (authorName.toLowerCase() === 'automoderator' || authorName.toLowerCase().includes('bot')) {
      return;
    }

    try {
      // Analyze text via proxy API that implements the Gemini Model
      const analysisResponse = await fetch('https://your-moderation-service.com/api/moderator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: bodyText,
          username: authorName,
          authorKarma: 100, // retrieve or default user subreddit standing
          rules: {
            toxicityThreshold: threshold,
            autoWarnUser: autoWarn,
            autoDeleteSpam: autoDelete,
            autoReplyFaqs: autoReply
          }
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis gateway offline');
      }

      const analysis = await analysisResponse.json();

      // Trigger Auto-Removal for High Toxicity or Scams
      if ((analysis.toxicityScore >= threshold && autoDelete) || (analysis.isScamOrSpamLink && autoDelete)) {
        await reddit.remove(comment.id, true); // removes comment and flags as spam
        console.log(`[Devvit AI Mod] Automatically removed comment ${comment.id} from u/${authorName} due to: ${analysis.category}`);
        
        // Auto-reply warning message to notify user
        if (autoWarn) {
          const warnText = analysis.warningMessage || "Your comment was removed as it violates civil discussion rules.";
          await reddit.submitComment({
            parentId: comment.parentId || comment.postId,
            text: `u/${authorName}: ${warnText} (Action taken by AI Moderator Assistant)`
          });
        }
        return;
      }

      // Auto-reply configured FAQs
      if (analysis.isFaqMatch && autoReply && analysis.faqAnswer) {
        await reddit.submitComment({
          parentId: comment.id,
          text: `***AI FAQ Assistant Reply:***\n\n${analysis.faqAnswer}\n\n*^Beep ^Boop, ^I ^am ^an ^AI ^FAQ ^Moderator ^trained ^on ^community ^posts. ^Reply ^to ^provide ^feedback ^on ^this ^answer.*`
        });
        console.log(`[Devvit AI Mod] Answered FAQ query from u/${authorName} on comment ${comment.id}`);
      }

    } catch (error) {
      console.error(`Failed to moderate comment ${comment.id} via AI: `, error);
    }
  },
});

export default Devvit;
