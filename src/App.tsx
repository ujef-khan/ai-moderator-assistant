/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Sliders, ShieldCheck, Award, 
  Terminal, Sparkles, Bell, X, ShieldAlert,
  HardHat, RefreshCw, AlertTriangle, Sun, Moon
} from 'lucide-react';
import SubredditSimulator from './components/SubredditSimulator';
import ModConsole from './components/ModConsole';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReputationManager from './components/ReputationManager';
import CodeViewer from './components/CodeViewer';
import { RedditPost, RedditComment, ModSetting, FAQRule, UserReputation, ModActionLog, ToastItem } from './types';

// Constants for initial seed data
const INITIAL_POSTS: RedditPost[] = [
  {
    id: 'post-1',
    title: 'Devvit Setup failure on MacOS: cannot resolve import "@devvit/public-api"',
    body: `Hey developers! I am trying to scaffold my first Reddit Devvit app on macOS Sequoia.
    
    When running "devvit new-project", everything downloads, but the local package.json throws errors on tsc when resolving @devvit/public-api. Is there a trick? I have node v20.10.`,
    author: 'CodeWizard',
    subreddit: 'r/DevvitHackathon',
    authorKarma: 420,
    createdAt: Date.now() - 3600000 * 3,
    upvotes: 45,
    downvotes: 2,
    commentsCount: 3,
    isRemoved: false,
    isAutoRemoved: false
  },
  {
    id: 'post-2',
    title: 'Showcase: Built a real-time multiplayer Canvas Game inside active subreddits!',
    url: 'github.com/reddit-canvas-app',
    body: `After 3 weeks of code iterations inside Reddit playbox, I have successfully compiled a multiplayer drawing board using Devvit custom posts! 
    
    It saves pixels into high-speed KvStore caches and syncs color arrays to users in real-time. Give me suggestions on adding stroke width sliders!`,
    author: 'RedditSlinger',
    subreddit: 'r/DevvitHackathon',
    authorKarma: 1350,
    createdAt: Date.now() - 3600000 * 1.5,
    upvotes: 112,
    downvotes: 4,
    commentsCount: 2,
    isRemoved: false,
    isAutoRemoved: false
  },
  {
    id: 'post-3',
    title: 'Welcome: Subreddit Rules & AI Auto-Moderator Test Sandbox Sandbox',
    body: `A pinned moderator thread welcoming all hackers to tested our AI Moderator Assistant console.
    
    You can trigger live automatic moderation in real-time. Use the "Devvit QA Test Triggers" on the right panel to test toxic phrases, spam links, and setup FAQs! Or write your own comments. All AI checks execute securely server-side.`,
    author: 'DefaultMod',
    subreddit: 'r/DevvitHackathon',
    authorKarma: 9999,
    createdAt: Date.now() - 3600000 * 12,
    upvotes: 560,
    downvotes: 1,
    commentsCount: 1,
    isRemoved: false,
    isAutoRemoved: false
  }
];

const INITIAL_COMMENTS: RedditComment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    author: 'RedditSlinger',
    authorKarma: 1350,
    body: 'Make sure your global node_modules directory does not have standard conflicting packages. Running "npm cache clean --force" and re-launching the playbox fixed standard module failures for me last year.',
    createdAt: Date.now() - 3600000 * 2,
    upvotes: 12,
    downvotes: 0,
    isRemoved: false,
    isAutoRemoved: false,
    isWarningSent: false,
    aiScoreToxicity: 5,
    aiCategory: 'neutral',
    aiJustification: 'Helpful and polite advice'
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    author: 'DefaultMod',
    authorKarma: 9999,
    body: 'Agreed! Standard macOS installations sometimes fail to map environment paths. If you still encounter failures, please post your tsc logs here.',
    createdAt: Date.now() - 3600000 * 1,
    upvotes: 4,
    downvotes: 0,
    isRemoved: false,
    isAutoRemoved: false,
    isWarningSent: false,
    aiScoreToxicity: 2,
    aiCategory: 'neutral',
    aiJustification: 'Polite comment reinforcing guidelines'
  },
  {
    id: 'comm-3',
    postId: 'post-2',
    author: 'NewbieHacker',
    authorKarma: 15,
    body: 'Wow this looks stellar. I did not realize Reddit post frames supported real-time rendering at this speed! How do you trigger frame updates?',
    createdAt: Date.now() - 3600000 * 0.5,
    upvotes: 8,
    downvotes: 0,
    isRemoved: false,
    isAutoRemoved: false,
    isWarningSent: false,
    aiScoreToxicity: 4,
    aiCategory: 'neutral',
    aiJustification: 'Enthusiastic and positive technical praise'
  }
];

const INITIAL_FAQS: FAQRule[] = [
  {
    id: 'faq-1',
    keyword: 'install',
    replyTemplate: 'To install the latest Reddit Devvit SDK guidelines, run the quick terminal command: "npm i -g @devvit/cli". Verify paths with "devvit --version". Visit devvit.readme.io for specific packages.',
    useAIExpansion: true
  },
  {
    id: 'faq-2',
    keyword: 'kvstore',
    replyTemplate: 'Reddit Devvit provides a robust, low-latency KV Store directly inside context. Access it like this: "await context.kvStore.put(\'key\', value);" and "await context.kvStore.get(\'key\');". No third-party servers required.',
    useAIExpansion: true
  },
  {
    id: 'faq-3',
    keyword: 'hackathon',
    replyTemplate: 'The Devvit Developer Hackathon has attractive cash prizes and community badges. Submit your code directories and repository attachments directly on the Devpost hub before the deadline!',
    useAIExpansion: true
  }
];

const INITIAL_REPUTATIONS: UserReputation[] = [
  { username: 'u/CodeWizard', reputationScore: 420, totalWarnings: 0, totalComments: 4, totalFlagged: 0, status: 'clean' },
  { username: 'u/RedditSlinger', reputationScore: 1350, totalWarnings: 0, totalComments: 18, totalFlagged: 0, status: 'clean' },
  { username: 'u/DefaultMod', reputationScore: 9999, totalWarnings: 0, totalComments: 5, totalFlagged: 0, status: 'clean' },
  { username: 'u/NewbieHacker', reputationScore: 15, totalWarnings: 0, totalComments: 2, totalFlagged: 0, status: 'clean' },
  { username: 'u/ToxicTroll', reputationScore: -85, totalWarnings: 2, totalComments: 6, totalFlagged: 5, status: 'warned' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'console' | 'analytics' | 'reputation' | 'code'>('simulator');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('reddit_mod_dark_mode');
    return saved === 'true';
  });
  
  // App states
  const [posts, setPosts] = useState<RedditPost[]>(INITIAL_POSTS);
  const [comments, setComments] = useState<RedditComment[]>(INITIAL_COMMENTS);
  const [settings, setSettings] = useState<ModSetting>({
    toxicityThreshold: 65,
    aiSensitivity: 'medium',
    autoWarnUser: true,
    autoDeleteSpam: true,
    autoReplyFaqs: true,
    scamUrlProtection: true,
  });
  const [faqs, setFaqs] = useState<FAQRule[]>(INITIAL_FAQS);
  const [reputations, setReputations] = useState<UserReputation[]>(INITIAL_REPUTATIONS);
  const [logs, setLogs] = useState<ModActionLog[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  
  // Checking/Wait states
  const [isApiHealthy, setIsApiHealthy] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('reddit_mod_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Validate backend fullsite connection
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setIsApiHealthy(data.status === 'healthy');
        if (data.geminiConnected) {
          addToast('success', 'Gemini Cloud API active on Server! Enjoy smart AI Auto-Mod analysis.');
        } else {
          addToast('info', 'Subreddit simulation connected to offline developer rulesets.');
        }
      })
      .catch((e) => {
        setIsApiHealthy(false);
        addToast('error', 'Moderator server is offline. Safe dry-run protocols active.');
      });
  }, []);

  // Helpful toast notifications stack
  const addToast = (type: ToastItem['type'], message: string) => {
    const newToast: ToastItem = {
      id: Math.random().toString(),
      type,
      message
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  /**
   * Evaluator logic when a user publishes a comment inside the Simulator.
   */
  const handleAddComment = async (commentData: Omit<RedditComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'isRemoved' | 'isAutoRemoved' | 'isWarningSent'>) => {
    // 1. Enforce Ban list check
    const existingRep = reputations.find(r => r.username.toLowerCase() === commentData.author.toLowerCase());
    if (existingRep && existingRep.status === 'banned') {
      addToast('error', `Submission denied: u/${commentData.author} is banned from r/DevvitHackathon.`);
      return;
    }

    // 2. Insert comment locally with dummy scores to show immediate loading state
    const commentId = 'comm-' + Math.random().toString(36).substring(2, 9);
    const newComment: RedditComment = {
      ...commentData,
      id: commentId,
      createdAt: Date.now(),
      upvotes: 1,
      downvotes: 0,
      isRemoved: false,
      isAutoRemoved: false,
      isWarningSent: false
    };

    setComments(prev => [...prev, newComment]);
    setIsAnalyzing(true);

    try {
      // 3. API payload analysis
      const analysisResponse = await fetch('/api/moderator/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentData.body,
          username: commentData.author,
          authorKarma: existingRep?.reputationScore ?? 100,
          rules: settings,
          faqs: faqs
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('API return failed');
      }

      const report = await analysisResponse.json();

      // 4. Update the state item with active AI verdicts
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            aiScoreToxicity: report.toxicityScore,
            aiCategory: report.category,
            aiJustification: report.justification,
            isScamLink: report.isScamOrSpamLink,
            warningReason: report.warningMessage
          };
        }
        return c;
      }));

      // Make sure we update or register the author's reputation
      updateUserEngagement(commentData.author, report);

      // Trigger Devvit actions based on setting parameters
      const isToxicBreach = report.toxicityScore >= settings.toxicityThreshold;
      const isScamMatch = report.isScamOrSpamLink && settings.scamUrlProtection;

      if ((isToxicBreach && settings.autoDeleteSpam) || isScamMatch) {
        // Comment is deleted automagically
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return { ...c, isAutoRemoved: true };
          }
          return c;
        }));

        addToast('warn', `[Devvit AI Mod] Removed inappropriate comment submitted by ${commentData.author}!`);
        
        // Log to Audit trail
        addAuditLog(
          commentId, 
          'comment', 
          commentData.author, 
          commentData.body, 
          'remove', 
          `Auto-deleted due to class "${report.category || 'violation'}" with toxicity score ${report.toxicityScore}%`
        );

        // Submit warn notice under parent or as direct reply
        if (settings.autoWarnUser) {
          setComments(prev => prev.map(c => {
            if (c.id === commentId) {
              return { ...c, isWarningSent: true };
            }
            return c;
          }));

          // Simulate Auto-Mod Warn Comment
          const automodReplyId = 'automod-' + Math.random().toString();
          const autoModComment: RedditComment = {
            id: automodReplyId,
            postId: commentData.postId,
            author: 'u/AutoModerator',
            authorKarma: 9999,
            body: `u/${commentData.author}: ${report.warningMessage || 'Please keep replies collaborative and constructive.'}`,
            createdAt: Date.now() + 500,
            upvotes: 1,
            downvotes: 0,
            isRemoved: false,
            isAutoRemoved: false,
            isWarningSent: false,
            aiScoreToxicity: 0,
            aiJustification: 'Official Auto-Moderation notification'
          };
          setComments(prev => [...prev, autoModComment]);

          // Add a log for warning user
          addAuditLog(
            automodReplyId, 
            'comment', 
            'u/AutoModerator', 
            `Warned u/${commentData.author}`, 
            'warn', 
            `Issued: "${report.warningMessage}"`
          );
        }

      } else {
        // Comment is pristine! Proceed with general setup audit logging
        addAuditLog(
          commentId, 
          'comment', 
          commentData.author, 
          commentData.body, 
          'approve', 
          `Standard message cleared. Toxicity: ${report.toxicityScore}%`
        );

        // Check if FAQ matched and we configure Auto Replies
        if (report.isFaqMatch && settings.autoReplyFaqs && report.faqAnswer) {
          // Trigger Auto FAQ answer reply
          const faqReplyId = 'faq-rep-' + Math.random().toString();
          const faqComment: RedditComment = {
            id: faqReplyId,
            postId: commentData.postId,
            author: 'u/AutoModerator',
            authorKarma: 9999,
            body: `***AI FAQ Assistant Reply:*** \n\n${report.faqAnswer} \n\n*^Beep ^Boop, ^I ^am ^an ^AI ^FAQ ^Moderator ^trained ^on ^community ^posts.*`,
            createdAt: Date.now() + 800,
            upvotes: 2,
            downvotes: 0,
            isRemoved: false,
            isAutoRemoved: false,
            isWarningSent: false,
            aiScoreToxicity: 0,
            aiJustification: 'Reddit Devvit auto FAQ responder trigger'
          };
          
          setComments(prev => [...prev, faqComment]);
          addToast('success', `FAQ query identified! AI Replied automatically to u/${commentData.author}.`);
          
          addAuditLog(
            faqReplyId, 
            'comment', 
            'u/AutoModerator', 
            `FAQ reply to u/${commentData.author}`, 
            'reply', 
            `Auto-answered FAQ based on trigger.`
          );
        }
      }

    } catch (e: any) {
      console.error('Failed to moderate with server API:', e);
      addToast('error', 'API Analysis failed. Dry-run safety moderator triggered.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Register logs to action history
   */
  const addAuditLog = (
    targetId: string, 
    targetType: 'post' | 'comment', 
    author: string, 
    excerpt: string, 
    actionTaken: ModActionLog['actionTaken'], 
    reason: string
  ) => {
    const newLog: ModActionLog = {
      id: Math.random().toString(),
      timestamp: Date.now(),
      targetId,
      targetType,
      author,
      excerpt: excerpt.length > 50 ? excerpt.substring(0, 50) + '...' : excerpt,
      actionTaken,
      reason
    };
    setLogs(prev => [newLog, ...prev]);
  };

  /**
   * Keeps users ratings standing sync
   */
  const updateUserEngagement = (username: string, report: any) => {
    let normalizedName = username;
    if (!normalizedName.startsWith('u/')) {
      normalizedName = 'u/' + normalizedName;
    }

    setReputations(prev => {
      const exists = prev.find(user => user.username.toLowerCase() === normalizedName.toLowerCase());
      
      if (exists) {
        return prev.map(user => {
          if (user.username.toLowerCase() === normalizedName.toLowerCase()) {
            const isToxicViolation = report.toxicityScore >= settings.toxicityThreshold;
            const newWarnings = isToxicViolation ? user.totalWarnings + 1 : user.totalWarnings;
            const newStatus = newWarnings >= 3 
              ? 'banned' 
              : newWarnings > 1 
              ? 'shadowbanned' 
              : newWarnings === 1 
              ? 'warned' 
              : 'clean';
            
            const karmaModifier = isToxicViolation ? -35 : report.isScamOrSpamLink ? -50 : 5;
            
            if (newStatus === 'banned') {
              addToast('error', `Automated Ban: ${user.username} has reached 3 warnings! Access restricted.`);
            }

            return {
              ...user,
              totalComments: user.totalComments + 1,
              totalWarnings: newWarnings,
              totalFlagged: report.toxicityScore > 35 ? user.totalFlagged + 1 : user.totalFlagged,
              reputationScore: user.reputationScore + karmaModifier,
              status: newStatus as any
            };
          }
          return user;
        });
      } else {
        // Enlist new user to index
        const isToxicViolation = report.toxicityScore >= settings.toxicityThreshold;
        return [
          ...prev,
          {
            username: normalizedName,
            reputationScore: isToxicViolation ? 65 : 105,
            totalWarnings: isToxicViolation ? 1 : 0,
            totalComments: 1,
            totalFlagged: isToxicViolation ? 1 : 0,
            status: isToxicViolation ? 'warned' : 'clean'
          }
        ];
      }
    });
  };

  /**
   * Action to Override actions manually
   */
  const handleOverrideComment = (commentId: string, action: 'approve' | 'remove') => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        if (action === 'approve') {
          addToast('success', `Manual Override: Comment by u/${c.author} approved!`);
          addAuditLog(commentId, 'comment', 'SystemMod', c.body, 'override', 'Moderator manually approved comment, overriding AI toxicity removal.');
          return { ...c, isRemoved: false, isAutoRemoved: false };
        } else {
          addToast('warn', `Manual Override: Comment by u/${c.author} force removed.`);
          addAuditLog(commentId, 'comment', 'SystemMod', c.body, 'remove', 'Moderator manually censored comment from feed.');
          return { ...c, isRemoved: true };
        }
      }
      return c;
    }));
  };

  /**
   * Update settings from console
   */
  const handleUpdateSettings = (newSettings: ModSetting) => {
    setSettings(newSettings);
    addToast('success', 'KV Store rules updated on Reddit.');
    addAuditLog('settings-db', 'post', 'SystemMod', 'KV Moderator Config', 'override', `Toxicity threshold customized to ${newSettings.toxicityThreshold}%`);
  };

  /**
   * Manage FAQ databases sets
   */
  const handleAddFAQ = (newFAQ: Omit<FAQRule, 'id'>) => {
    const fresh: FAQRule = {
      ...newFAQ,
      id: 'faq-' + Math.random().toString()
    };
    setFaqs(prev => [...prev, fresh]);
    addToast('success', `Registered FAQ keyword matched pattern: "${newFAQ.keyword}"`);
  };

  const handleDeleteFAQ = (id: string) => {
    const item = faqs.find(f => f.id === id);
    setFaqs(prev => prev.filter(f => f.id !== id));
    if (item) {
      addToast('info', `Removed FAQ trigger keyword: "${item.keyword}"`);
    }
  };

  /**
   * Manual standing calibration
   */
  const handleAdjustKarma = (username: string, value: number) => {
    setReputations(prev => prev.map(user => {
      if (user.username === username) {
        const nextScore = user.reputationScore + value;
        return { ...user, reputationScore: nextScore };
      }
      return user;
    }));
    addToast('success', `Adjusted u/${username} standing by ${value > 0 ? '+' : ''}${value} Karma points.`);
  };

  const handleUpdateStatus = (username: string, status: UserReputation['status']) => {
    setReputations(prev => prev.map(user => {
      if (user.username === username) {
        return { ...user, status };
      }
      return user;
    }));
    addToast('info', `Set u/${username} app reputation standing index to ${status.toUpperCase()}`);
  };

  const handleAddUser = (username: string, initialKarma: number) => {
    setReputations(prev => [
      ...prev,
      {
        username,
        reputationScore: initialKarma,
        totalWarnings: 0,
        totalComments: 0,
        totalFlagged: 0,
        status: 'clean'
      }
    ]);
    addToast('success', `Registered test standing profile for ${username}.`);
  };

  return (
    <div className={`min-h-screen flex flex-col antialiased transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Toast Alert Canvas Frame */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 pointer-events-auto border ${
                toast.type === 'success'
                  ? isDarkMode ? 'bg-emerald-950/90 border-emerald-900/50 text-emerald-200' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : toast.type === 'warn'
                  ? isDarkMode ? 'bg-amber-950/90 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'
                  : toast.type === 'error'
                  ? isDarkMode ? 'bg-red-950/90 border-red-900/50 text-red-200' : 'bg-red-50 border-red-100 text-red-800'
                  : isDarkMode ? 'bg-indigo-950/90 border-indigo-900/50 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
              }`}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                {toast.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-500" />}
              </div>
              <div className="flex-1 text-xs leading-relaxed font-semibold">
                {toast.message}
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                className="text-gray-400 hover:text-gray-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Page Header */}
      <header className={`border-b sticky top-0 z-50 transition-colors duration-300 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800 backdrop-blur-md' : 'bg-white border-gray-150'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                D
              </div>
              <div>
                <h1 className={`text-lg font-extrabold font-sans tracking-tight transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-950'
                }`}>AI Moderator Assistant</h1>
                <p className={`text-[11px] font-mono transition-colors ${
                  isDarkMode ? 'text-zinc-400' : 'text-gray-400'
                }`}>REDDIT DEVVIT DEVS HACKATHON WORKSPACE</p>
              </div>
            </div>

            {/* Dark Theme Button on Mobile */}
            <div className="md:hidden">
              <motion.button
                id="theme-toggle-mobile"
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-10 h-10 rounded-2xl cursor-pointer border transition-colors flex items-center justify-center shadow-xs ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-yellow-405' 
                    : 'bg-orange-50 border-orange-200 text-orange-605'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Desktop Dark Theme Toggle - Double Pill Slide Layout */}
            <div className="hidden md:block">
              <div 
                id="theme-toggle-desktop"
                className={`p-1 rounded-full cursor-pointer border flex items-center gap-1 relative w-[92px] h-[40px] transition-all duration-300 shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-gray-100/90 hover:bg-gray-200/80 border-gray-200/80'
                }`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {/* Slidable background container using layout prop */}
                <motion.div 
                  className={`absolute top-1 bottom-1 w-[38px] rounded-full shadow-xs z-0 ${
                    isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200/45'
                  }`}
                  layout
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  style={{ left: isDarkMode ? '48px' : '4px' }}
                />
                
                {/* Sun icon for Light Theme select */}
                <span className={`w-[38px] h-[30px] flex items-center justify-center rounded-full z-10 transition-colors ${
                  !isDarkMode ? 'text-orange-500 font-bold font-sans' : 'text-zinc-500 hover:text-zinc-400'
                }`}>
                  <Sun className={`w-4 h-4 ${!isDarkMode ? 'scale-110 drop-shadow-xs' : ''}`} />
                </span>
                
                {/* Moon icon for Dark Theme select */}
                <span className={`w-[38px] h-[30px] flex items-center justify-center rounded-full z-10 transition-colors ${
                  isDarkMode ? 'text-yellow-400 font-bold font-sans' : 'text-gray-400 hover:text-gray-650'
                }`}>
                  <Moon className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Navigation Controls */}
            <nav className={`flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto transition-colors ${
              isDarkMode ? 'bg-zinc-800' : 'bg-gray-100'
            }`}>
              <motion.button
                id="nav-tab-simulator"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('simulator')}
                className={`px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs whitespace-nowrap transition ${
                  activeTab === 'simulator' 
                    ? isDarkMode ? 'bg-zinc-700 text-orange-400 shadow-xs' : 'bg-white text-orange-700 shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Reddit Sandbox
              </motion.button>
              <motion.button
                id="nav-tab-console"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('console')}
                className={`px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs whitespace-nowrap transition ${
                  activeTab === 'console' 
                    ? isDarkMode ? 'bg-zinc-700 text-orange-400 shadow-xs' : 'bg-white text-orange-700 shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                AI Parameters
              </motion.button>
              <motion.button
                id="nav-tab-analytics"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs whitespace-nowrap transition ${
                  activeTab === 'analytics' 
                    ? isDarkMode ? 'bg-zinc-700 text-orange-400 shadow-xs' : 'bg-white text-orange-700 shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Analytics
              </motion.button>
              <motion.button
                id="nav-tab-reputation"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('reputation')}
                className={`px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs whitespace-nowrap transition ${
                  activeTab === 'reputation' 
                    ? isDarkMode ? 'bg-zinc-700 text-orange-400 shadow-xs' : 'bg-white text-orange-700 shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Karma Standings
              </motion.button>
              <motion.button
                id="nav-tab-code"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('code')}
                className={`px-3.5 py-2 rounded-xl cursor-pointer font-bold text-xs whitespace-nowrap transition ${
                  activeTab === 'code' 
                    ? isDarkMode ? 'bg-zinc-700 text-orange-400 shadow-xs' : 'bg-white text-orange-700 shadow-xs' 
                    : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Exports
              </motion.button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main body Frame content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'simulator' && (
              <SubredditSimulator 
                posts={posts} 
                comments={comments} 
                settings={settings}
                faqs={faqs}
                onAddComment={handleAddComment}
                onOverrideComment={handleOverrideComment}
                isAnalyzing={isAnalyzing}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'console' && (
              <ModConsole
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                faqs={faqs}
                onAddFAQ={handleAddFAQ}
                onDeleteFAQ={handleDeleteFAQ}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard 
                comments={comments} 
                logs={logs}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'reputation' && (
              <ReputationManager
                reputations={reputations}
                onAdjustKarma={handleAdjustKarma}
                onUpdateStatus={handleUpdateStatus}
                onAddUser={handleAddUser}
                isDarkMode={isDarkMode}
              />
            )}

            {activeTab === 'code' && (
              <CodeViewer isDarkMode={isDarkMode} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Subpage footer elements */}
      <footer className={`border-t py-6 mt-12 text-center text-xs font-mono transition-colors duration-300 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-gray-150 text-gray-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            Sandbox Environment Active • Port 3000 Ingress
          </div>
          <span>Developed using Reddit-styled Tailwind Components & Gemini-3.5-flash AI</span>
        </div>
      </footer>
    </div>
  );
}
