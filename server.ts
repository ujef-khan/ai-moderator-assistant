/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Shared Gemini Setup
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Gemini SDK] Initialized successfully with Server API Key.');
  } catch (error) {
    console.error('[Gemini SDK] Failed to initialize GoogleGenAI client:', error);
  }
} else {
  console.log('[Gemini SDK] No valid API Key found. Operating in simulation-fallback mode.');
}

// Subreddit Mock Local Rule Matching for offline-first resilience
interface MockResult {
  toxicityScore: number;
  isToxic: boolean;
  category: string;
  isScamOrSpamLink: boolean;
  justification: string;
  isFaqMatch: boolean;
  faqAnswer: string;
  warningMessage: string;
}

function handleMockAnalysis(text: string, faqs: { keyword: string; replyTemplate: string }[], threshold: number): MockResult {
  const lowercase = text.toLowerCase();
  
  // Toxicity Patterns
  const heavyToxicity = ['kill yourself', 'die', 'fuck you', 'retard', 'bitch', 'scum', 'asshole', 'cunt'];
  const lightToxicity = ['idiot', 'stupid', 'loser', 'jerk', 'moron', 'shut up', 'hate you', 'crap'];
  
  let toxicityScore = 0;
  let category = 'neutral';
  
  for (const w of heavyToxicity) {
    if (lowercase.includes(w)) {
      toxicityScore = Math.max(toxicityScore, 85 + Math.floor(Math.random() * 10));
      category = 'harassment';
    }
  }
  
  if (toxicityScore === 0) {
    for (const w of lightToxicity) {
      if (lowercase.includes(w)) {
        toxicityScore = Math.max(toxicityScore, 45 + Math.floor(Math.random() * 15));
        category = 'insult';
      }
    }
  }
  
  if (toxicityScore === 0) {
    toxicityScore = Math.floor(Math.random() * 15); // low ambient toxicity
  }
  
  const isToxic = toxicityScore >= threshold;
  
  // Scam and Spam Link Patterns
  const scamPatterns = [
    'free-crypto', 'earn-fast', 'get-rich', 'giftcard', 'generator', 'steamkeys',
    'paypals-claim', 'bit.ly/claim', 't.co/scam', 't.me/crypto', 'airdrop',
    'free-token', 'doubledmymoney'
  ];
  
  const hasLinkInText = lowercase.includes('http://') || lowercase.includes('https://') || lowercase.includes('www.') || lowercase.includes('.com') || lowercase.includes('.ru') || lowercase.includes('.info');
  let isScamOrSpamLink = false;
  
  if (hasLinkInText) {
    for (const pattern of scamPatterns) {
      if (lowercase.includes(pattern)) {
        isScamOrSpamLink = true;
        category = 'scam';
        toxicityScore = Math.max(toxicityScore, 75);
      }
    }
  }
  
  // FAQ keywords match
  let isFaqMatch = false;
  let faqAnswer = '';
  
  for (const faq of faqs) {
    const kw = faq.keyword.toLowerCase();
    if (lowercase.includes(kw) && kw.length > 2) {
      isFaqMatch = true;
      faqAnswer = faq.replyTemplate;
      break;
    }
  }
  
  // Justification
  let justification = 'Comment appears clean, fits standards of polite subreddit conversation.';
  if (isScamOrSpamLink) {
    justification = 'Flagged as potential scam; includes suspicious promotional link promising abnormal payouts/actions.';
  } else if (isToxic) {
    justification = `Flagged for toxicity (Score: ${toxicityScore}%); content is hostile or displays aggressive insults (${category}).`;
  } else if (isFaqMatch) {
    justification = `Automatically recognized as a common query related to developer setup/rules.`;
  }
  
  // Warning message
  let warningMessage = 'Please ensure you remain respectful and adhere strictly to our codebase guidelines.';
  if (category === 'harassment') {
    warningMessage = 'Hey! Subreddit rules strictly prohibit highly abusive behavior and targeted harassment. Please keep discussions civil.';
  } else if (category === 'insult') {
    warningMessage = 'Reminder from r/Devvit moderators: please stay professional. Focus on the code, not on personal attacks.';
  } else if (isScamOrSpamLink) {
    warningMessage = 'Warning: Sharing affiliate networks, cryptocurrency referral schemas, or suspicious external mirrors is restricted.';
  }
  
  return {
    toxicityScore,
    isToxic,
    category,
    isScamOrSpamLink,
    justification,
    isFaqMatch,
    faqAnswer,
    warningMessage
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());
  
  // API Endpoint to analyze comment / post
  app.post('/api/moderator/analyze', async (req, res) => {
    const { text, username, authorKarma, rules, faqs = [], isPost = false } = req.body;
    
    const threshold = rules?.toxicityThreshold ?? 65;
    
    // Check if we have active Gemini capability
    if (ai) {
      try {
        const prompt = `
          Analyze this ${isPost ? 'post' : 'comment'} submitted by a user on a developer subreddit.
          Evaluate it for toxicity, safety, spam links, and potential FAQ matching.
          
          User comment details:
          - Username: u/${username}
          - User Local Subreddit Karma: ${authorKarma}
          - Text Body: "${text}"
          
          Subreddit Auto-Moderator configuration:
          - Toxicity removal threshold score: ${threshold} (0-100)
          
          List of FAQs for checking match:
          ${JSON.stringify(faqs.map((f: any) => ({ name: f.keyword, replyTemplate: f.replyTemplate })))}
          
          Rules:
          - Assess toxicity (0-100 score). Harsh harassment, threats, and strong insults should score 80-100. Polite conversation, constructive feedback, and developer jokes score under 20.
          - Identify isScamOrSpamLink: Check if links or text looks like spam bots (cryptocurrency offers, suspicious giveaways, telegram groups, malicious links).
          - Check isFaqMatch: Does the text contain an active query about one of the configured FAQs? If yes, set isFaqMatch to true and compose a helpful Reddit auto-response in 'faqAnswer' using the 'replyTemplate' as guidance or auto-expanding it beautifully.
          - warningMessage: Create a natural, authoritative Reddit Mod message telling the user why they were warned/moderated (if toxicity is high or scam is found).
          
          You MUST respond in strict JSON format mapping to the schema below.
        `;
        
        console.log(`[Gemini Request] Analyzing text of length ${text.length} from u/${username}...`);
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2, // low temp for accurate classifications
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                toxicityScore: { type: Type.INTEGER, description: 'Toxicity score from 0-100 rating hostility.' },
                isToxic: { type: Type.BOOLEAN, description: 'True if toxicityScore >= threshold rules.' },
                category: { type: Type.STRING, description: 'Best fit category: neutral, insult, threat, harassment, scam, spam.' },
                isScamOrSpamLink: { type: Type.BOOLEAN, description: 'True if detecting telegram groups, phishing, free gift cards, or crypto-scam links.' },
                justification: { type: Type.STRING, description: 'A 1-sentence reasoning explaining the AI moderation verdict.' },
                isFaqMatch: { type: Type.BOOLEAN, description: 'True if comment asks a question matching one of the subreddit keywords.' },
                faqAnswer: { type: Type.STRING, description: 'Formulated subreddit expert system reply message answering the user, empty if not FAQ.' },
                warningMessage: { type: Type.STRING, description: 'Constructive u/AutoModerator warning alert to be sent to user in case of infraction.' }
              },
              required: ['toxicityScore', 'isToxic', 'category', 'isScamOrSpamLink', 'justification', 'isFaqMatch', 'faqAnswer', 'warningMessage']
            }
          }
        });
        
        const rawText = response.text?.trim() ?? '{}';
        console.log('[Gemini Response]:', rawText);
        const parsed = JSON.parse(rawText);
        
        return res.json(parsed);
      } catch (err: any) {
        console.error('[Gemini API Error] Falling back to offline rule moderator:', err.message);
        const fallback = handleMockAnalysis(text, faqs, threshold);
        return res.json({
          ...fallback,
          justification: `[Auto-Moderator Offline Fallback] ${fallback.justification}`
        });
      }
    } else {
      // Offline/No-key fallback
      const fallback = handleMockAnalysis(text, faqs, threshold);
      return res.json({
        ...fallback,
        justification: `[Simulation Safe Sandbox Mode] ${fallback.justification}`
      });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      geminiConnected: ai !== null,
      currentTime: new Date().toISOString()
    });
  });
  
  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express custom fullsite server] Running dynamically on http://localhost:${PORT}`);
  });
}

startServer();
