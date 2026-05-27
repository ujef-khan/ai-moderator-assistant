/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Sparkles, Sliders, ToggleLeft, ToggleRight, 
  HelpCircle, Plus, Trash2, Save, BadgeAlert, RefreshCw, KeyRound 
} from 'lucide-react';
import { ModSetting, FAQRule } from '../types';

interface ModConsoleProps {
  settings: ModSetting;
  onUpdateSettings: (newSettings: ModSetting) => void;
  faqs: FAQRule[];
  onAddFAQ: (newFAQ: Omit<FAQRule, 'id'>) => void;
  onDeleteFAQ: (id: string) => void;
  isDarkMode?: boolean;
}

export default function ModConsole({
  settings,
  onUpdateSettings,
  faqs,
  onAddFAQ,
  onDeleteFAQ,
  isDarkMode = false
}: ModConsoleProps) {
  // Local states for settings to submit on click
  const [threshold, setThreshold] = useState(settings.toxicityThreshold);
  const [sensitivity, setSensitivity] = useState(settings.aiSensitivity);
  const [autoWarn, setAutoWarn] = useState(settings.autoWarnUser);
  const [autoDelete, setAutoDelete] = useState(settings.autoDeleteSpam);
  const [autoReply, setAutoReply] = useState(settings.autoReplyFaqs);
  const [scamProtect, setScamProtect] = useState(settings.scamUrlProtection);

  // FAQ Form States
  const [keyword, setKeyword] = useState('');
  const [template, setTemplate] = useState('');
  const [useAI, setUseAI] = useState(true);

  // Dynamic Theme Styling helper definitions
  const cardStyle = isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100' : 'bg-white border border-gray-100 text-gray-950';
  const titleStyle = isDarkMode ? 'text-white' : 'text-gray-950';
  const labelStyle = isDarkMode ? 'text-zinc-300 font-semibold' : 'text-gray-800 font-bold';
  const descStyle = isDarkMode ? 'text-zinc-500' : 'text-gray-400';
  const boxBg = isDarkMode ? 'bg-zinc-950/40 border border-zinc-805 text-zinc-300' : 'bg-gray-50 border-gray-100';
  const inputStyle = isDarkMode 
    ? 'bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-650 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-900 focus:border-purple-500 font-mono transition-colors' 
    : 'bg-white border border-gray-100 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-200';

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      toxicityThreshold: threshold,
      aiSensitivity: sensitivity,
      autoWarnUser: autoWarn,
      autoDeleteSpam: autoDelete,
      autoReplyFaqs: autoReply,
      scamUrlProtection: scamProtect,
    });
  };

  const handleFAQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || !template.trim()) return;

    onAddFAQ({
      keyword,
      replyTemplate: template,
      useAIExpansion: useAI,
    });
    setKeyword('');
    setTemplate('');
  };

  return (
    <div id="mod-console-settings" className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Settings Form Column */}
      <form onSubmit={handleSettingsSave} className="md:col-span-6 flex flex-col gap-6">
        <div className={`rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-colors duration-300 ${cardStyle}`}>
          <div className={`border-b pb-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${titleStyle}`}>
              <Sliders className="w-5 h-5 text-orange-500" />
              AI Moderation Policy Settings
            </h2>
            <p className={`text-xs mt-1 ${descStyle}`}>
              Configure parameters governing Devvit AI moderator triggers on comment streams.
            </p>
          </div>

          {/* Toxicity Threshold Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label className={labelStyle}>Toxicity Threshold Score</label>
              <span className={`font-mono font-bold px-2.5 py-1 rounded-md transition-colors ${
                isDarkMode ? 'text-orange-400 bg-orange-950/40' : 'text-orange-600 bg-orange-50'
              }`}>
                {threshold}%
              </span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="95" 
              value={threshold} 
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              placeholder="Toxicity score threshold parameter"
              className="w-full accent-orange-600 h-1.5 bg-gray-150 rounded-lg cursor-pointer"
            />
            <p className={`text-xs ${descStyle}`}>
              Comments exceeding this score are flagged or auto-removed based on instructions. Lower values are stricter.
            </p>
          </div>

          {/* AI Toxicity Sensitivity select */}
          <div className="flex flex-col gap-2">
            <label className={`text-sm ${labelStyle}`}>AI Prompt Guidelines Sensitivity</label>
            <select
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value as any)}
              className={`rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition ${
                isDarkMode 
                  ? 'bg-zinc-950 border border-zinc-800 text-zinc-200 focus:bg-zinc-900 focus:border-orange-500' 
                  : 'bg-gray-50 border border-gray-100 text-gray-705 focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white'
              }`}
            >
              <option value="low">Low Sensitivity (Only aggressive toxicity blocks)</option>
              <option value="medium">Medium Sensitivity (Flags minor passive-aggression)</option>
              <option value="strict">Strict Sensitivity (Zero tolerance on sarcastic complaints)</option>
            </select>
          </div>

          <div className={`border-t pt-4 flex flex-col gap-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-bold uppercase tracking-widest pb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-800'}`}>
              Active Moderation Directives
            </h3>

            {/* Auto Delete Toggle */}
            <div className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <h4 className={`text-sm font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Auto-Remove Toxicity
                </h4>
                <p className={`text-xs ${descStyle}`}>
                  Instantly remove comments that cross the toxicity threshold.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setAutoDelete(!autoDelete)}
                className="text-orange-500 hover:text-orange-600 transition cursor-pointer"
              >
                {autoDelete ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} />}
              </button>
            </div>

            {/* Auto Warning Toggle */}
            <div className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Warn & Explain to Infracting Authors
                </h4>
                <p className={`text-xs ${descStyle}`}>
                  Replies automatically under the removed thread detailing warning.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setAutoWarn(!autoWarn)}
                className="text-orange-500 hover:text-orange-600 transition cursor-pointer"
              >
                {autoWarn ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} />}
              </button>
            </div>

            {/* Auto Reply FAQs Toggle */}
            <div className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <h4 className={`text-sm font-extrabold ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Enable FAQ Smart Responses
                </h4>
                <p className={`text-xs ${descStyle}`}>
                  Synthesize automatic contextual answers when keywords match common queries.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setAutoReply(!autoReply)}
                className="text-orange-500 hover:text-orange-600 transition cursor-pointer"
              >
                {autoReply ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} />}
              </button>
            </div>

            {/* Scam URL protection Toggle */}
            <div className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition ${
              isDarkMode ? 'bg-zinc-950/40 border-zinc-805' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <h4 className={`text-sm font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  Spam/Phishing url Protection
                </h4>
                <p className={`text-xs ${descStyle}`}>
                  Block cryptocurrency leaks, telegram mirrors, and scam landing pages.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setScamProtect(!scamProtect)}
                className="text-orange-500 hover:text-orange-600 transition cursor-pointer"
              >
                {scamProtect ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className={`w-10 h-10 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} />}
              </button>
            </div>
          </div>

          {/* Submit policy change */}
          <button
            type="submit"
            id="save-settings-btn"
            className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Apply App Rules to Reddit Devvit KV Store
          </button>
        </div>
      </form>

      {/* FAQ Rules Configuration Column */}
      <div className="md:col-span-6 flex flex-col gap-6">
        {/* Custom FAQ rules definition */}
        <div className={`rounded-3xl p-6 shadow-sm flex flex-col gap-6 transition-colors duration-300 ${cardStyle}`}>
          <div className={`border-b pb-4 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${titleStyle}`}>
              <KeyRound className="w-5 h-5 text-purple-500" />
              Subreddit FAQ Reply Database
            </h2>
            <p className={`text-xs mt-1 ${descStyle}`}>
              Add phrases containing questions configuration. Gemini expands them gracefully inside user comment timelines in real-time.
            </p>
          </div>

          <form onSubmit={handleFAQSubmit} className={`flex flex-col gap-4 p-4 rounded-2xl border transition-colors duration-300 ${
            isDarkMode ? 'bg-purple-950/10 border-purple-900/30' : 'bg-purple-50/20 border-purple-100/40'
          }`}>
            <div className={`text-xs font-bold flex items-center gap-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>
              <Plus className="w-3.5 h-3.5" />
              Create New Trigger Pattern
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-zinc-350' : 'text-gray-750'}`}>Trigger Keyword / Phrase Match</label>
              <input 
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. 'install' or 'how do i setup'"
                className={`text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-950 border border-zinc-805 text-purple-300 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-900' 
                    : 'bg-white border border-gray-105 text-purple-900 focus:ring-1 focus:ring-purple-200'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold ${isDarkMode ? 'text-zinc-350' : 'text-gray-755'}`}>Moderator Prepared Template Response</label>
              <textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="e.g. 'Run npm i -g @devvit/cli to install our tools. Check devvit.readme.io/quickstart for macOS compatibility.'"
                rows={3}
                className={`text-xs p-3 rounded-xl focus:outline-none transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-950 border border-zinc-805 text-zinc-200 focus:bg-zinc-900 focus:ring-1 focus:ring-purple-900' 
                    : 'bg-white border border-gray-105 text-gray-700 focus:ring-1 focus:ring-purple-200'
                }`}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className={descStyle}>Expand dynamically using Gemini?</span>
              <button
                type="button"
                onClick={() => setUseAI(!useAI)}
                className={`text-xs font-semibold cursor-pointer ${
                  isDarkMode ? 'text-purple-400 hover:text-purple-350' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                {useAI ? 'Expand with AI (Yes)' : 'Hardcoded Template (No)'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ Intent Trigger
            </button>
          </form>

          {/* Active List */}
          <div className="flex flex-col gap-3">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-gray-800'}`}>
              Active Smart FAQ Directives ({faqs.length})
            </h3>

            {faqs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center py-6 text-xs font-medium border border-dotted rounded-xl ${
                  isDarkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-950/20' : 'border-gray-150 text-gray-400'
                }`}
              >
                No FAQ rule directives active. Create one above!
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {faqs.map(faq => (
                    <motion.div 
                      key={faq.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className={`flex justify-between items-start gap-3 p-3 rounded-xl border transition-colors ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-805' : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Matched: "{faq.keyword}"</span>
                        <p className={`text-[11px] leading-normal line-clamp-2 ${isDarkMode ? 'text-zinc-300' : 'text-gray-600'}`}>
                          {faq.replyTemplate}
                        </p>
                        {faq.useAIExpansion && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded self-start mt-0.5 ${
                            isDarkMode ? 'text-blue-400 bg-blue-955 border border-blue-900/30' : 'text-blue-600 bg-blue-50'
                          }`}>
                            ✓ Gemini Auto-Enhanced
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        id={`delete-faq-${faq.id}`}
                        onClick={() => onDeleteFAQ(faq.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
