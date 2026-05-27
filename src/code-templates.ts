/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEVVIT_CODE_TEMPLATES = {
  main: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * src/main.tsx
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
        console.log(\`[Devvit AI Mod] Automatically removed comment \${comment.id} from u/\${authorName} due to: \${analysis.category}\`);
        
        // Auto-reply warning message to notify user
        if (autoWarn) {
          const warnText = analysis.warningMessage || "Your comment was removed as it violates civil discussion rules.";
          await reddit.submitComment({
            parentId: comment.parentId || comment.postId,
            text: \`u/\${authorName}: \${warnText} (Action taken by AI Moderator Assistant)\`
          });
        }
        return;
      }

      // Auto-reply configured FAQs
      if (analysis.isFaqMatch && autoReply && analysis.faqAnswer) {
        await reddit.submitComment({
          parentId: comment.id,
          text: \`***AI FAQ Assistant Reply:***\\n\\n\${analysis.faqAnswer}\\n\\n*^Beep ^Boop, ^I ^am ^an ^AI ^FAQ ^Moderator ^trained ^on ^community ^posts. ^Reply ^to ^provide ^feedback ^on ^this ^answer.*\`
        });
        console.log(\`[Devvit AI Mod] Answered FAQ query from u/\${authorName} on comment \${comment.id}\`);
      }

    } catch (error) {
      console.error(\`Failed to moderate comment \${comment.id} via AI: \`, error);
    }
  },
});

export default Devvit;
`,

  helpers: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * src/helpers.ts
 * Utility Helper Functions for Devvit Reddit Integration.
 */

/**
 * Checks if a string contains known spam link patterns directly on the client.
 * Pre-evaluates before calling complex LLM endpoints if latency is a constraint.
 */
export function isSuspiciousText(text: string): boolean {
  const lowercase = text.toLowerCase();
  const sketchKeywords = [
    'free-crypto', 'earn-quick-cash', 'claim-crypto-airdrop', 
    'giftcard-generators', 'fastmoneyhack', 'steam-gift-for-free',
    'paypals-fast-claim'
  ];
  
  if (lowercase.includes('http') || lowercase.includes('www.') || lowercase.includes('.com')) {
    return sketchKeywords.some(keyword => lowercase.includes(keyword));
  }
  return false;
}

/**
 * Normalizes scores from diverse telemetry feeds to evaluate user reputation multipliers.
 */
export function calculateKarmaScoreModifier(subredditKarma: number, warningCount: number): number {
  let score = 100;
  
  // High warnings discount user standard standing heavily
  score -= (warningCount * 30);
  
  // Add direct premium weighting for long-term positive contributors
  if (subredditKarma > 500) {
    score += 20;
  } else if (subredditKarma < 0) {
    score -= 15;
  }
  
  return Math.max(-100, Math.min(100, score));
}
`,

  readme: `# Reddit AI Moderator Assistant Devvit App
An advanced, Gemini-powered auto-moderation and community safety chatbot for Reddit communities, built using Reddit Devvit and Node.js.

## Features
- **Real-Time Toxicity Scanning**: Scans community comment submits to identify hostility, insults, harassment, and threats.
- **Phishing & Spam Link Prevention**: Immediate auto-detection and removal of cryptocurrency scams, suspicious Telegram invitations, and referral fraud.
- **Subreddit FAQ Auto-Reply**: Fully-contextual AI responses targeting configured support questions so users get instant developer assistance.
- **Flexible Console Overlay**: Reddit native settings form allows adjusting toxicity thresholds, active protection rulesets, and alerts.
- **KV Store caching**: Config parameters and user statistics caches run directly on Reddit fast-access datastores.

## Setup Requirements
1. Install Reddit Devvit CLI:
   \`\`\`bash
   npm install -g @devvit/cli
   \`\`\`
2. Log in with your Reddit account:
   \`\`\`bash
   devvit login
   \`\`\`
3. Setup an environment secret with your Gemini endpoint or Moderator backend URL:
   \`\`\`bash
   devvit playbox secrets set MODERATOR_API_ENDPOINT="https://your-moderation-service.com/api"
   \`\`\`

## Installation & Launch
Create a fresh Devvit directory:
\`\`\`bash
devvit new-project ai-moderator-assistant
\`\`\`
Choose TypeScript when prompted. Replace the contents of \`src/main.tsx\` with our copy-paste code.

Compile & run in development:
\`\`\`bash
devvit playbox
\`\`\`
Or publish onto an active test subreddit:
\`\`\`bash
devvit publish r/YourDevvitTestSub
\`\`\`
`,

  deployment: `## Deployment Instructions
To host the full-stack backend server permanently on Cloud Run (which anchors the Gemini API queries securely):

1. **Verify environment secrets**:
   Ensure \`GEMINI_API_KEY\` is loaded dynamically in the secrets vault of your Google Cloud Project or Reddit Devvit secrets manager.

2. **Run production compilation**:
   Compresses both client Vite frontend bundle and Server-side Express bundle into single self-contained CJS scripts.
   \`\`\`bash
   npm run build
   \`\`\`

3. **Start the Production Container**:
   Build, containerize, and start:
   \`\`\`bash
   docker build -t ai-moderator-server .
   docker run -p 3000:3000 -e GEMINI_API_KEY="YOUR_KEY_HERE" ai-moderator-server
   \`\`\`
`
};
