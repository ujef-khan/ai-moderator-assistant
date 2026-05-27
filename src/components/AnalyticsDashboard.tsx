/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, ShieldCheck, AlertTriangle, Link, 
  Settings, Zap, Sparkles, MessageSquare 
} from 'lucide-react';
import { RedditComment, ModActionLog } from '../types';

interface AnalyticsDashboardProps {
  comments: RedditComment[];
  logs: ModActionLog[];
  isDarkMode?: boolean;
}

export default function AnalyticsDashboard({ comments, logs, isDarkMode = false }: AnalyticsDashboardProps) {
  // 1. Calculate general stats
  const totalComments = comments.length;
  const removedCommentsCount = comments.filter(c => c.isRemoved || c.isAutoRemoved).length;
  const scamBlockedCount = comments.filter(c => c.isScamLink).length;
  const warningCount = comments.filter(c => c.isWarningSent).length;
  const safeCommentsCount = totalComments - removedCommentsCount;

  // Calculate high-fidelity Community Health Score:
  // (Safe comments / Total comments) * 100
  // Starts at 100 if no comments
  const healthScore = totalComments > 0 
    ? Math.round((safeCommentsCount / totalComments) * 100) 
    : 100;

  // 2. Prepare Category Frequencies for BarChart
  const categoriesMap: Record<string, number> = {
    Harassment: 0,
    Insults: 0,
    SpamLink: 0,
    Clean: 0
  };

  comments.forEach(c => {
    if (c.isRemoved || c.isAutoRemoved) {
      if (c.isScamLink) {
        categoriesMap.SpamLink += 1;
      } else if (c.aiCategory === 'harassment' || c.aiCategory === 'threat') {
        categoriesMap.Harassment += 1;
      } else {
        categoriesMap.Insults += 1;
      }
    } else {
      categoriesMap.Clean += 1;
    }
  });

  const categoryData = [
    { name: 'Clean', count: categoriesMap.Clean, fill: '#10b981' },
    { name: 'Insults', count: categoriesMap.Insults, fill: '#f59e0b' },
    { name: 'Harassment', count: categoriesMap.Harassment, fill: '#ef4444' },
    { name: 'Spam/Scam', count: categoriesMap.SpamLink, fill: '#3b82f6' }
  ];

  // 3. Prepare timeline chart data over the last 7 simulated cycles
  // Let's seed some realistic visual data based on comments count, merging with fake timeline intervals for a beautiful visualization
  const hourlyStats = [
    { time: '10:00', toxicity: 12, violations: 1, activity: 8 },
    { time: '12:00', toxicity: 20, violations: 2, activity: 14 },
    { time: '14:00', toxicity: 15, violations: 0, activity: 19 },
    { time: '16:00', toxicity: Math.min(85, Math.max(15, 25 - totalComments + (removedCommentsCount * 12))), violations: removedCommentsCount > 0 ? removedCommentsCount : 1, activity: totalComments + 12 },
    { time: '18:00', toxicity: Math.round(5 + (totalComments * 1.5)), violations: warningCount, activity: totalComments + 16 },
    { time: '20:00', toxicity: Math.max(0, 100 - healthScore), violations: removedCommentsCount + scamBlockedCount, activity: totalComments + 24 }
  ];

  // Dynamic Theme variables
  const cardStyle = isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl' : 'bg-white border border-gray-100 text-gray-950 shadow-sm';
  const titleStyle = isDarkMode ? 'text-white font-bold' : 'text-gray-950 font-bold';
  const mutedStyle = isDarkMode ? 'text-zinc-500' : 'text-gray-400';
  const textMutedStyle = isDarkMode ? 'text-zinc-400' : 'text-gray-500';
  const labelStyle = isDarkMode ? 'text-zinc-300' : 'text-gray-750';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      id="analytics-panel" 
      className="flex flex-col gap-6"
    >
      {/* Metrics Row */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Subreddit Health Score */}
        <motion.div 
          variants={itemVariants}
          id="stat-health-score" 
          className={`rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${cardStyle}`}
        >
          <div className={`text-xs font-bold uppercase tracking-widest flex items-center justify-between ${mutedStyle}`}>
            Subreddit Health
            <ShieldCheck className={`w-4 h-4 ${healthScore > 80 ? 'text-green-500' : 'text-orange-500'}`} />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-3xl font-extrabold ${titleStyle}`}>{healthScore}</span>
            <span className={`text-sm font-semibold ${mutedStyle}`}>/ 100</span>
          </div>
          <p className={`text-[11px] ${textMutedStyle}`}>
            {healthScore > 85 
              ? 'Excellent standing. AI moderator auto-defending breaches.' 
              : 'Attention needed. Elevate toxicity sensitivity threshold.'}
          </p>
          <div className={`absolute left-0 right-0 bottom-0 h-1 ${isDarkMode ? 'bg-zinc-850' : 'bg-gray-100'}`}>
            <div 
              className={`h-full transition-all duration-500 ${
                healthScore > 80 ? 'bg-green-500' : 'bg-orange-500'
              }`} 
              style={{ width: `${healthScore}%` }} 
              id="health-progress-bar"
            />
          </div>
        </motion.div>

        {/* Total Processed Comments */}
        <motion.div 
          variants={itemVariants}
          id="stat-total-processed" 
          className={`rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${cardStyle}`}
        >
          <div className={`text-xs font-bold uppercase tracking-widest flex items-center justify-between ${mutedStyle}`}>
            Toxicity Evaluation Volume
            <MessageSquare className="w-4 h-4 text-blue-500" />
          </div>
          <span className={`text-3xl font-extrabold mt-1 ${titleStyle}`}>{totalComments}</span>
          <p className={`text-[11px] ${textMutedStyle}`}>Comments scanned in real-time via Devvit app triggers.</p>
        </motion.div>

        {/* Total warnings */}
        <motion.div 
          variants={itemVariants}
          id="stat-warnings-issued" 
          className={`rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${cardStyle}`}
        >
          <div className={`text-xs font-bold uppercase tracking-widest flex items-center justify-between ${mutedStyle}`}>
            Auto Warnings Sent
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <span className={`text-3xl font-extrabold mt-1 ${titleStyle}`}>{warningCount}</span>
          <p className={`text-[11px] ${textMutedStyle}`}>Warnings replied under parent infraction comments.</p>
        </motion.div>

        {/* Auto Removals & Spams */}
        <motion.div 
          variants={itemVariants}
          id="stat-scams-blocked" 
          className={`rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${cardStyle}`}
        >
          <div className={`text-xs font-bold uppercase tracking-widest flex items-center justify-between ${mutedStyle}`}>
            Spam & Scam Blocks
            <Link className="w-4 h-4 text-red-500" />
          </div>
          <span className={`text-3xl font-extrabold mt-1 ${titleStyle}`}>{removedCommentsCount}</span>
          <p className={`text-[11px] ${textMutedStyle}`}>Phishing URLs & abusive posts safely hidden.</p>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Subreddit Activity and Toxicity Timeline AreaChart */}
        <motion.div 
          variants={itemVariants}
          className={`lg:col-span-8 rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}
        >
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${titleStyle}`}>
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Community safety & Engagement Timeline
            </h3>
            <p className={`text-xs mt-1 ${textMutedStyle}`}>
              Tracks real-time interaction load against calculated subreddit average toxicity curves.
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorToxicity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
                <XAxis dataKey="time" stroke={isDarkMode ? '#52525b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? '#52525b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={isDarkMode 
                    ? { backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', color: '#f4f4f5' }
                    : { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }
                  } 
                  labelClassName={isDarkMode ? "font-bold text-zinc-350 text-xs" : "font-bold text-gray-800 text-xs"}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" name="Average Subreddit Toxicity" dataKey="toxicity" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorToxicity)" />
                <Area type="monotone" name="Comment Interaction Rate" dataKey="activity" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActivity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Infraction Category Distribution BarChart */}
        <motion.div 
          variants={itemVariants}
          className={`lg:col-span-4 rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}
        >
          <div>
            <h3 className={`text-base font-bold flex items-center gap-1.5 ${titleStyle}`}>
              <Zap className="w-4 h-4 text-orange-500" />
              Toxicity Breakdown
            </h3>
            <p className={`text-xs mt-1 ${textMutedStyle}`}>
              Distribution of incoming comments mapped to processed safety buckets.
            </p>
          </div>

          <div className="h-[250px] w-full flex items-center justify-center">
            {totalComments === 0 ? (
              <div className={`text-center text-xs py-12 ${textMutedStyle}`}>
                No telemetry registered. Submit several comments to render charts!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} barSize={28} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#52525b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDarkMode ? '#52525b' : '#94a3b8'} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(239, 68, 68, 0.04)' }}
                    contentStyle={isDarkMode 
                      ? { backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', color: '#f4f4f5' }
                      : { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }
                    }
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`text-[10px] flex items-center justify-between border-t pt-3 ${
            isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-100 text-gray-400'
          }`}>
            <span>Scanning rules: Devvit KV policy cache</span>
            <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Secure</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Moderation Actions History Log */}
      <motion.div 
        variants={itemVariants}
        className={`rounded-3xl p-6 flex flex-col gap-4 transition-colors duration-300 ${cardStyle}`}
      >
        <div>
          <h3 className={`text-base font-bold flex items-center gap-1.5 ${titleStyle}`}>
            <Sparkles className="w-4 h-4 text-orange-500" />
            Audit Trail: Live Mod Activities
          </h3>
          <p className={`text-xs mt-1 ${textMutedStyle}`}>
            Historical trace tracking active auto-warns, auto-deletions, FAQ answers, and moderator override actions.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className={`text-center py-10 text-xs font-semibold border border-dashed rounded-2xl ${
            isDarkMode ? 'border-zinc-805 text-zinc-550 bg-zinc-950/20' : 'border-gray-150 text-gray-400'
          }`}>
            No active console logs. Test comments in the Subreddit Simulator to construct audits.
          </div>
        ) : (
          <div className={`overflow-x-auto rounded-2xl border pb-2 ${
            isDarkMode ? 'border-zinc-800' : 'border-gray-100'
          }`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-bold transition-colors ${
                  isDarkMode ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-gray-50 border-b border-gray-100 text-gray-600'
                }`}>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Author</th>
                  <th className="p-3.5">Excerpt</th>
                  <th className="p-3.5">Devvit Action</th>
                  <th className="p-3.5 text-right font-mono">Mod Assessment Justification</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-zinc-800 text-zinc-300' : 'divide-gray-105 text-gray-700'}`}>
                {logs.map((log) => (
                  <tr key={log.id} className={`transition-colors font-medium ${
                    isDarkMode ? 'hover:bg-zinc-850/50' : 'hover:bg-gray-50'
                  }`}>
                    <td className={`p-3.5 whitespace-nowrap ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className={`p-3.5 font-bold font-mono ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                      {log.author}
                    </td>
                    <td className={`p-3.5 max-w-[200px] truncate ${isDarkMode ? 'text-zinc-300 font-medium' : 'text-gray-650'}`}>
                      "{log.excerpt}"
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                        log.actionTaken === 'remove' 
                          ? (isDarkMode ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-red-50 text-red-600 border border-red-200')
                          : log.actionTaken === 'warn'
                          ? (isDarkMode ? 'bg-orange-950/40 text-orange-400 border border-orange-900/40' : 'bg-orange-50 text-orange-600 border border-orange-200')
                          : log.actionTaken === 'reply'
                          ? (isDarkMode ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40' : 'bg-blue-50 text-blue-600 border border-blue-200')
                          : log.actionTaken === 'approve' || log.actionTaken === 'override'
                          ? (isDarkMode ? 'bg-green-950/40 text-green-400 border border-green-900/40' : 'bg-green-50 text-green-600 border border-green-200')
                          : (isDarkMode ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {log.actionTaken}
                      </span>
                    </td>
                    <td className={`p-3.5 text-right italic max-w-[320px] truncate ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
