/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RedditComment {
  id: string;
  postId: string;
  parentId?: string;
  author: string;
  authorKarma: number;
  body: string;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  isRemoved: boolean;
  isAutoRemoved: boolean;
  isWarningSent: boolean;
  warningReason?: string;
  aiScoreToxicity?: number;
  aiCategory?: string;
  aiJustification?: string;
  isScamLink?: boolean;
  autoReplyText?: string;
}

export interface RedditPost {
  id: string;
  title: string;
  body?: string;
  author: string;
  subreddit: string;
  authorKarma: number;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  url?: string;
  commentsCount: number;
  isRemoved: boolean;
  isAutoRemoved: boolean;
  aiScoreToxicity?: number;
  aiJustification?: string;
  isScamLink?: boolean;
}

export interface ModSetting {
  toxicityThreshold: number; // 0 to 100
  aiSensitivity: 'low' | 'medium' | 'strict';
  autoWarnUser: boolean;
  autoDeleteSpam: boolean;
  autoReplyFaqs: boolean;
  scamUrlProtection: boolean;
}

export interface FAQRule {
  id: string;
  keyword: string;
  replyTemplate: string;
  useAIExpansion: boolean;
}

export interface UserReputation {
  username: string;
  reputationScore: number; // -100 to 1000
  totalWarnings: number;
  totalComments: number;
  totalFlagged: number;
  status: 'clean' | 'warned' | 'shadowbanned' | 'banned';
}

export interface ModActionLog {
  id: string;
  timestamp: number;
  targetId: string;
  targetType: 'post' | 'comment';
  author: string;
  excerpt: string;
  actionTaken: 'remove' | 'warn' | 'reply' | 'flag' | 'approve' | 'override';
  reason: string;
  score?: number;
  isOverridden?: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'warn' | 'error' | 'info';
  message: string;
}
