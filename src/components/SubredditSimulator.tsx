/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, ArrowBigUp, ArrowBigDown, ShieldAlert, 
  Send, Sparkles, CheckCircle, HelpCircle, AlertTriangle, 
  Trash2, User, Link2, KeyRound 
} from 'lucide-react';
import { RedditPost, RedditComment, ModSetting, FAQRule } from '../types';

interface SubredditSimulatorProps {
  posts: RedditPost[];
  comments: RedditComment[];
  settings: ModSetting;
  faqs: FAQRule[];
  onAddComment: (comment: Omit<RedditComment, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'isRemoved' | 'isAutoRemoved' | 'isWarningSent'>) => Promise<void>;
  onOverrideComment: (commentId: string, action: 'approve' | 'remove') => void;
  isAnalyzing: boolean;
  isDarkMode?: boolean;
}

export default function SubredditSimulator({
  posts,
  comments,
  settings,
  faqs,
  onAddComment,
  onOverrideComment,
  isAnalyzing,
  isDarkMode = false
}: SubredditSimulatorProps) {
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [newCommentBody, setNewCommentBody] = useState('');
  const [customAuthor, setCustomAuthor] = useState('u/DevvitHacker');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Theme Styling helper definitions
  const cardStyle = isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-gray-100 text-gray-950';
  const titleStyle = isDarkMode ? 'text-white' : 'text-gray-950';
  const descStyle = isDarkMode ? 'text-zinc-300' : 'text-gray-700';
  const mutedStyle = isDarkMode ? 'text-zinc-500' : 'text-gray-400';
  const innerBgStyle = isDarkMode ? 'bg-zinc-950/50 border border-zinc-850' : 'bg-gray-50/50 border border-gray-50';
  const inputBgStyle = isDarkMode ? 'bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-900 focus:ring-orange-950 focus:border-orange-600' : 'bg-gray-50 border border-gray-100 text-gray-700 placeholder:text-gray-400 focus:bg-white focus:ring-orange-100 focus:border-orange-400';

  const selectedPost = posts.find(p => p.id === selectedPostId);
  const postComments = comments.filter(c => c.postId === selectedPostId);

  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentBody.trim()) return;

    setIsSubmitting(true);
    await onAddComment({
      postId: selectedPostId,
      author: customAuthor,
      authorKarma: 120,
      body: newCommentBody,
    });
    setNewCommentBody('');
    setIsSubmitting(false);
  };

  const handleQuickTriggerSubmit = async (text: string, author = 'u/GuestTester') => {
    setIsSubmitting(true);
    await onAddComment({
      postId: selectedPostId,
      author: author,
      authorKarma: 85,
      body: text,
    });
    setIsSubmitting(false);
  };

  return (
    <div id="subreddit-simulator" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Subreddit Feed Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Subreddit Header */}
        <div id="subreddit-banner" className="bg-gradient-to-r from-orange-600 to-orange-400 rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none">
            <Sparkles className="w-64 h-64 -mr-16 -mb-16 rotate-12" />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-orange-600 font-extrabold text-2xl shadow-inner border-2 border-orange-100">
                r/
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">r/DevvitHackathon</h2>
                <p className="text-orange-100 text-sm font-medium">Devvit SDK AI Arena Sandbox • 21,040 developers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-200">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse mr-1" />
              Devvit AI Active Mod Enabled
            </div>
          </div>
        </div>

        {/* Dynamic Post Tabs */}
        <div className={`rounded-2xl flex p-1.5 gap-2 shadow-xs transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'
        }`}>
          {posts.map(post => (
            <button
              key={post.id}
              id={`tab-post-${post.id}`}
              onClick={() => setSelectedPostId(post.id)}
              className={`flex-1 text-left px-4 py-3 rounded-xl transition duration-155 ease-in-out font-medium text-sm flex flex-col gap-1 cursor-pointer ${
                selectedPostId === post.id 
                  ? isDarkMode ? 'bg-zinc-800 text-orange-400 font-semibold shadow-xs' : 'bg-orange-50 text-orange-700 font-semibold shadow-xs' 
                  : isDarkMode ? 'text-zinc-400 hover:bg-zinc-850 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="truncate max-w-[200px]">{post.title}</span>
              <span className={`text-xs font-mono ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>u/{post.author}</span>
            </button>
          ))}
        </div>

        {/* Selected Reddit Post Frame */}
        {selectedPost && (
          <div id={`post-detail-${selectedPost.id}`} className={`rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}>
            <div className={`flex items-center gap-2.5 text-xs font-mono ${mutedStyle}`}>
              <span className={`font-semibold px-2.5 py-1 rounded-md ${
                isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-gray-100 text-gray-600'
              }`}>PINNED BY MODS</span>
              <span>• Posted by u/{selectedPost.author}</span>
              <span>• Karma: {selectedPost.authorKarma}</span>
            </div>
            
            <h1 className={`text-xl font-bold font-sans tracking-tight ${titleStyle}`}>{selectedPost.title}</h1>
            
            {selectedPost.body && (
              <p className={`leading-relaxed text-sm p-4 rounded-2xl ${
                isDarkMode ? 'text-zinc-200 bg-zinc-950/45 border border-zinc-805' : 'text-gray-700 bg-gray-50/50 border border-gray-50'
              }`}>
                {selectedPost.body}
              </p>
            )}

            {selectedPost.url && (
              <a 
                href={`https://${selectedPost.url}`} 
                target="_blank" 
                rel="no-referrer"
                className={`inline-flex items-center gap-2 font-medium text-sm px-4 py-3 rounded-xl border self-start transition-all ${
                  isDarkMode 
                    ? 'text-orange-400 bg-orange-950/10 hover:bg-orange-950/20 border-orange-900/40' 
                    : 'text-blue-600 hover:underline bg-blue-50/50 hover:bg-blue-50 border-blue-100'
                }`}
              >
                <Link2 className="w-4 h-4" />
                {selectedPost.url}
              </a>
            )}

            <div className={`flex items-center gap-4 pt-2 border-t mt-2 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-gray-50 text-gray-500'
              }`}>
                <ArrowBigUp className="w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors" />
                <span>{selectedPost.upvotes - selectedPost.downvotes}</span>
                <ArrowBigDown className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors" />
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold ${mutedStyle}`}>
                <MessageSquare className="w-4 h-4" />
                <span>{postComments.length} Comments</span>
              </div>
            </div>
          </div>
        )}

        {/* Comment Submission Frame */}
        <div id="comment-composer" className={`rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${titleStyle}`}>
            <MessageSquare className="w-4 h-4 text-orange-500" />
            Join the conversation as
          </h3>
          
          <form onSubmit={handlePostCommentSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border ${inputBgStyle}`}>
                <User className="w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={customAuthor} 
                  onChange={(e) => setCustomAuthor(e.target.value)} 
                  placeholder="Username (e.g. u/DevvitHacker)"
                  className="bg-transparent border-none text-sm outline-none w-full font-mono placeholder:text-gray-400"
                  required
                />
              </div>
              <div className={`text-xs flex items-center px-3 py-2 rounded-xl border ${
                isDarkMode ? 'text-zinc-400 bg-zinc-950/40 border-zinc-800' : 'text-gray-400 bg-gray-50/40 border-gray-100'
              }`}>
                Testing sandbox: Enter custom names to simulate warnings on different users!
              </div>
            </div>

            <div className="relative">
              <textarea
                value={newCommentBody}
                onChange={(e) => setNewCommentBody(e.target.value)}
                placeholder="Write your Reddit comment reply here... Ask an FAQ keyword, link something, or push test feedback!"
                rows={3}
                className={`w-full text-sm p-4 rounded-2xl outline-none transition-all disabled:opacity-50 ${
                  isDarkMode 
                    ? 'text-white bg-zinc-950 border border-zinc-800 placeholder:text-zinc-650 focus:bg-zinc-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-900' 
                    : 'text-gray-800 bg-gray-50 border border-gray-100 placeholder:text-gray-400 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                }`}
                disabled={isSubmitting || isAnalyzing}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || isAnalyzing || !newCommentBody.trim()}
                className="absolute bottom-4 right-4 bg-orange-600 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Checking AI...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Comment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Comment Thread */}
        <div id="comment-thread" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold font-sans ${titleStyle}`}>Active Thread Replies</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono ${
              isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-400'
            }`}>Real-time simulation active</span>
          </div>

          {postComments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-12 rounded-3xl p-6 flex flex-col items-center gap-1 ${
                isDarkMode ? 'bg-zinc-900/60 border border-zinc-800/60' : 'bg-gray-50 border border-gray-100/60'
              }`}
            >
              <MessageSquare className="w-8 h-8 text-gray-300 animate-bounce" />
              <p className="text-sm font-medium text-gray-500">No replies yet.</p>
              <p className="text-xs text-gray-400">Use Sandbox Quick-Triggers or write a custom test comment above!</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {postComments.map((comment) => {
                  const hasInfraction = comment.aiScoreToxicity !== undefined && (comment.isRemoved || comment.isAutoRemoved || comment.aiScoreToxicity >= settings.toxicityThreshold || comment.isScamLink);
                  
                  return (
                    <motion.div 
                      key={comment.id} 
                      id={`comment-item-${comment.id}`}
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -24, scale: 0.97 }}
                      layout
                      transition={{ type: "spring", stiffness: 350, damping: 26 }}
                      className={`border rounded-3xl p-5 shadow-xs transition-all duration-300 relative ${
                        comment.isRemoved || comment.isAutoRemoved
                          ? isDarkMode ? 'opacity-85 border-red-950 bg-red-950/15' : 'opacity-85 border-red-100 bg-red-50/20'
                          : hasInfraction
                          ? isDarkMode ? 'border-red-900/80 bg-orange-950/10 shadow-xs' : 'border-red-200 bg-orange-50/10 shadow-xs'
                          : comment.author === 'u/AutoModerator'
                          ? isDarkMode ? 'border-zinc-850 bg-blue-950/15 border-l-4 border-l-blue-500' : 'border-blue-100 bg-blue-50/20 border-l-4 border-l-blue-500'
                          : isDarkMode ? 'border-zinc-800 bg-zinc-900/90' : 'border-gray-100 bg-white'
                      }`}
                    >
                    {/* Comment Header */}
                    <div className={`flex items-center justify-between gap-2.5 text-xs pb-3 border-b mb-3 ${
                      isDarkMode ? 'border-zinc-800' : 'border-gray-100/60'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          comment.author === 'u/AutoModerator' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {comment.author === 'u/AutoModerator' ? '🤖' : 'U'}
                        </div>
                        <span className={`font-mono font-bold ${
                          comment.author === 'u/AutoModerator' 
                            ? (isDarkMode ? 'text-blue-400' : 'text-blue-700') 
                            : (isDarkMode ? 'text-zinc-200' : 'text-gray-900')
                        }`}>
                          {comment.author}
                        </span>
                        <span className={mutedStyle}>• Karma Standing: {comment.authorKarma}</span>
                      </div>
                      
                      {/* Interactive Moderation Status Badge */}
                      <div className="flex items-center gap-1.5">
                        {comment.isRemoved || comment.isAutoRemoved ? (
                          <span className="bg-red-950/40 text-red-400 border border-red-900/50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <Trash2 className="w-3 h-3" />
                            Removed by AI Mod
                          </span>
                        ) : comment.isScamLink ? (
                          <span className="bg-red-950/40 text-red-500 border border-red-900/50 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Scam Blocked
                          </span>
                        ) : comment.aiScoreToxicity !== undefined && comment.aiScoreToxicity >= settings.toxicityThreshold ? (
                          <span className="bg-amber-950/50 text-amber-400 border border-amber-900/40 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Toxic Flagged ({comment.aiScoreToxicity}%)
                          </span>
                        ) : comment.aiScoreToxicity !== undefined && comment.aiScoreToxicity < settings.toxicityThreshold && comment.aiScoreToxicity > 15 ? (
                          <span className="bg-green-950/30 text-green-400 border border-green-900/30 px-2.5 py-1 rounded-md text-[10px] font-semibold">
                            Clean Score ({comment.aiScoreToxicity}%)
                          </span>
                        ) : comment.author === 'u/AutoModerator' ? (
                          <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                            Official Devvit App
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Comment Body */}
                    <div className="text-sm leading-relaxed">
                      {comment.isRemoved || comment.isAutoRemoved ? (
                        <div className={`italic px-4 py-3 rounded-2xl flex flex-col gap-1.5 select-none ${
                          isDarkMode ? 'text-zinc-500 bg-zinc-950/60 border border-zinc-805' : 'text-gray-400 bg-gray-50 border border-gray-100'
                        }`}>
                          <p className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase not-italic">
                            <Trash2 className="w-3.5 h-3.5" />
                            Comment Automatically Removed
                          </p>
                          <span>"This statement violates r/Devvit community guidelines on high-toxicity and safe developer conduct."</span>
                        </div>
                      ) : (
                        <div className={`whitespace-pre-line font-medium ${isDarkMode ? 'text-zinc-100 font-normal' : 'text-gray-900'}`}>{comment.body}</div>
                      )}
                    </div>

                    {/* AI Mod Assessment Overlay (Visible to Moderator simulator) */}
                    {comment.aiScoreToxicity !== undefined && !comment.author.includes('AutoModerator') && (
                      <div className={`mt-4 rounded-2xl p-4 border flex flex-col gap-2 ${
                        isDarkMode ? 'bg-zinc-950/65 border-zinc-800' : 'bg-gray-50/50 border-gray-100'
                      }`}>
                        <div className={`flex flex-wrap items-center justify-between gap-2 text-xs border-b pb-2 ${
                          isDarkMode ? 'border-zinc-805' : 'border-gray-100'
                        }`}>
                          <div className={`flex items-center gap-2 font-semibold uppercase tracking-wider text-[10px] ${
                            isDarkMode ? 'text-zinc-400' : 'text-gray-600'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            Devvit Gemini Assessment
                          </div>
                          <div className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>
                            Category: <span className="font-semibold text-orange-400 font-mono italic">{comment.aiCategory || 'neutral'}</span>
                          </div>
                        </div>
                        <p className={`text-xs italic ${isDarkMode ? 'text-zinc-300' : 'text-gray-650'}`}>
                          "{comment.aiJustification || 'No anomaly flagged. Content is safe.'}"
                        </p>
                        
                        {/* Mod Controls to override AI decisions */}
                        <div className={`flex justify-end gap-2 pt-2 border-t mt-1 ${isDarkMode ? 'border-zinc-805' : 'border-gray-100/60'}`}>
                          {comment.isRemoved || comment.isAutoRemoved ? (
                            <button
                              id={`override-approve-${comment.id}`}
                              onClick={() => onOverrideComment(comment.id, 'approve')}
                              className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer font-bold border flex items-center gap-1 transition-colors ${
                                isDarkMode 
                                  ? 'bg-green-950/40 text-green-400 hover:bg-green-950/60 border-green-900/50' 
                                  : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Override AI (Approve Comment)
                            </button>
                          ) : hasInfraction ? (
                            <button
                              id={`override-remove-${comment.id}`}
                              onClick={() => onOverrideComment(comment.id, 'remove')}
                              className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer font-bold border flex items-center gap-1 transition-colors ${
                                isDarkMode 
                                  ? 'bg-red-950/40 text-red-400 hover:bg-red-950/60 border-red-900/50' 
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                              Approve AI Deletion
                            </button>
                          ) : (
                            <button
                              id={`override-force-remove-${comment.id}`}
                              onClick={() => onOverrideComment(comment.id, 'remove')}
                              className={`text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-semibold border flex items-center gap-1 transition ${
                                isDarkMode 
                                  ? 'bg-zinc-800 hover:bg-red-950/20 text-zinc-300 hover:text-red-400 border-zinc-700 hover:border-red-900/30' 
                                  : 'bg-gray-100 hover:bg-red-50 text-gray-650 hover:text-red-700 border-gray-200 hover:border-red-100'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                              Force Deletion
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upvote/Downvote actions */}
                    {!comment.author.includes('AutoModerator') && (
                      <div className="flex items-center gap-2 pt-3 text-xs text-gray-500 font-semibold font-mono mt-2">
                        <ArrowBigUp className="w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors" />
                        <span>{comment.upvotes - comment.downvotes}</span>
                        <ArrowBigDown className="w-4 h-4 cursor-pointer hover:text-blue-500 transition-colors" />
                      </div>
                    )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Side Sandbox Controller Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Quick Sandbox Triggers */}
        <div id="quick-scenario-triggers" className={`rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}>
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${titleStyle}`}>
              <Sparkles className="w-5 h-5 text-orange-500" />
              Devvit QA Test Triggers
            </h3>
            <p className={`text-xs mt-1 ${mutedStyle}`}>
              Instantly submit pre-composed scenarios to see the AI Auto-Moderator analyze and apply Devvit policy triggers in milliseconds.
            </p>
                 <div className="flex flex-col gap-3">
            {/* Active Safe Comment */}
            <motion.button
              whileHover={{ scale: 1.025, x: 4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => handleQuickTriggerSubmit(
                "Super clean tutorial! This is actually the first chess game I have seen fully functional in Reddit's feed.",
                "u/CleanCoder"
              )}
              className={`group text-left p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-green-950/15 hover:bg-green-950/25 border-green-900/30 hover:border-green-800' 
                  : 'bg-green-50/50 hover:bg-green-10 border-green-100 hover:border-green-200'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Scenario 1: Standard Safe
                </span>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded-md font-mono font-normal uppercase ${
                  isDarkMode ? 'border-green-900/60 bg-zinc-950 text-green-400' : 'border-green-200 bg-white text-green-600/70'
                }`}>Neutral</span>
              </div>
              <p className={`text-xs line-clamp-1 italic transition-colors ${
                isDarkMode ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-gray-650 group-hover:text-gray-900'
              }`}>
                "Super clean tutorial! This is actually the first chess..."
              </p>
            </motion.button>

            {/* Toxic Statement Trigger */}
            <motion.button
              whileHover={{ scale: 1.025, x: 4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => handleQuickTriggerSubmit(
                "You are an absolute idiot, delete your account. This code is full of shit and you have absolutely zero talent. Shut up.",
                "u/ToxicTroll"
              )}
              className={`group text-left p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-red-950/15 hover:bg-red-950/25 border-red-900/30 hover:border-red-800' 
                  : 'bg-red-50/50 hover:bg-red-10 border-red-105 hover:border-red-200'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Scenario 2: Heavy Toxic
                </span>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded-md font-mono font-normal uppercase ${
                  isDarkMode ? 'border-red-900/60 bg-zinc-950 text-red-405' : 'border-red-200 bg-white text-red-600/70'
                }`}>Harassment</span>
              </div>
              <p className={`text-xs line-clamp-1 italic transition-colors ${
                isDarkMode ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-gray-650 group-hover:text-gray-900'
              }`}>
                "You are an absolute idiot, delete your account. This code..."
              </p>
            </motion.button>

            {/* Scam Link Trigger */}
            <motion.button
              whileHover={{ scale: 1.025, x: 4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => handleQuickTriggerSubmit(
                "Claim free claim fast! 🚀 I doubled my crypto in 5 minutes! Claim free bitcoin and airdrops here: www.claim-crypto-airdrop.com/free !",
                "u/CryptoBot"
              )}
              className={`group text-left p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-amber-950/15 hover:bg-amber-950/25 border-amber-900/30 hover:border-amber-800' 
                  : 'bg-orange-50/50 hover:bg-orange-10 border-orange-150 hover:border-orange-250'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-amber-400' : 'text-orange-700'
              }`}>
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Scenario 3: Scam Promo
                </span>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded-md font-mono font-normal uppercase ${
                  isDarkMode ? 'border-amber-900/60 bg-zinc-950 text-amber-500' : 'border-orange-200 bg-white text-orange-600/70'
                }`}>Phishing</span>
              </div>
              <p className={`text-xs line-clamp-1 italic transition-colors ${
                isDarkMode ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-gray-650 group-hover:text-gray-900'
              }`}>
                "Claim free claim fast! 🚀 I doubled my crypto in 5 min..."
              </p>
            </motion.button>

            {/* FAQ Setup Prompt Trigger */}
            <motion.button
              whileHover={{ scale: 1.025, x: 4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => handleQuickTriggerSubmit(
                "Wait, has anyone else had issues with devvit installation? Where can I read the setup instructions and rules?",
                "u/NewbieHacker"
              )}
              className={`group text-left p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-blue-950/15 hover:bg-blue-950/25 border-blue-900/30 hover:border-blue-800' 
                  : 'bg-blue-50/50 hover:bg-blue-10 border-blue-100 hover:border-blue-200'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Scenario 4: Intent: FAQ Query
                </span>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded-md font-mono font-normal uppercase ${
                  isDarkMode ? 'border-blue-900/60 bg-zinc-950 text-blue-400' : 'border-blue-200 bg-white text-blue-600/70'
                }`}>Support</span>
              </div>
              <p className={`text-xs line-clamp-1 italic transition-colors ${
                isDarkMode ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-gray-650 group-hover:text-gray-900'
              }`}>
                "Wait, has anyone else had issues with devvit install..."
              </p>
            </motion.button>

            {/* Configured FAQ Keyword */}
            <motion.button
              whileHover={{ scale: 1.025, x: 4 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => handleQuickTriggerSubmit(
                "Do we need a separate server to configure key-value store database operations in Devvit?",
                "u/DataDev"
              )}
              className={`group text-left p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-1 transition-all shadow-xs ${
                isDarkMode 
                  ? 'bg-purple-950/15 hover:bg-purple-950/25 border-purple-900/30 hover:border-purple-800' 
                  : 'bg-purple-50/50 hover:bg-purple-10 border-purple-100 hover:border-purple-200'
              }`}
            >
              <div className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-purple-400' : 'text-purple-700'
              }`}>
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  Scenario 5: KV Store FAQ
                </span>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded-md font-mono font-normal uppercase ${
                  isDarkMode ? 'border-purple-900/60 bg-zinc-950 text-purple-400' : 'border-purple-200 bg-white text-purple-600/70'
                }`}>Developer</span>
              </div>
              <p className={`text-xs line-clamp-1 italic transition-colors ${
                isDarkMode ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-gray-650 group-hover:text-gray-900'
              }`}>
                "Do we need a separate server to configure kvStore db..."
              </p>
            </motion.button>
          </div>
          </div>
        </div>

        {/* Current Active Rules Panel */}
        <div id="rules-summary" className={`rounded-3xl p-6 shadow-sm flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}>
          <h3 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-2 ${titleStyle}`}>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            Active App Ruleset
          </h3>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805 text-zinc-300' : 'bg-gray-50 border-gray-100/60 text-gray-700'
            }`}>
              <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>Toxicity Threshold:</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                isDarkMode ? 'bg-orange-950/60 text-orange-400' : 'bg-orange-100 text-orange-850'
              }`}>{settings.toxicityThreshold}%</span>
            </div>
            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805 text-zinc-300' : 'bg-gray-50 border-gray-100/60 text-gray-700'
            }`}>
              <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>Scam Link auto removal:</span>
              <span className={`font-semibold ${settings.autoDeleteSpam ? 'text-green-500' : 'text-gray-450'}`}>
                {settings.autoDeleteSpam ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805 text-zinc-300' : 'bg-gray-50 border-gray-100/60 text-gray-700'
            }`}>
              <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>Warning reply to users:</span>
              <span className={`font-semibold ${settings.autoWarnUser ? 'text-green-500' : 'text-gray-455'}`}>
                {settings.autoWarnUser ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805 text-zinc-300' : 'bg-gray-50 border-gray-100/60 text-gray-700'
            }`}>
              <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>FAQ auto reply:</span>
              <span className={`font-semibold ${settings.autoReplyFaqs ? 'text-green-500' : 'text-gray-455'}`}>
                {settings.autoReplyFaqs ? 'ACTIVE' : 'DISABLED'}
              </span>
            </div>
            <div className={`flex justify-between items-center p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-855 text-zinc-300' : 'bg-gray-50 border-gray-100/60 text-gray-750'
            }`}>
              <span className={isDarkMode ? 'text-zinc-400' : 'text-gray-500'}>Active FAQ keyword list:</span>
              <span className={`font-mono px-2.5 py-0.5 rounded-full font-bold ${
                isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'
              }`}>{faqs.length} trigger phrases</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
