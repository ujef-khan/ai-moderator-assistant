/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, ShieldAlert, Award, Star, Search, Plus, 
  Trash2, Sliders, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { UserReputation } from '../types';

interface ReputationProps {
  reputations: UserReputation[];
  onAdjustKarma: (username: string, value: number) => void;
  onUpdateStatus: (username: string, status: UserReputation['status']) => void;
  onAddUser: (username: string, initialKarma: number) => void;
  isDarkMode?: boolean;
}

export default function ReputationManager({
  reputations,
  onAdjustKarma,
  onUpdateStatus,
  onAddUser,
  isDarkMode = false
}: ReputationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add User states
  const [newUsername, setNewUsername] = useState('');
  const [initialKarmaInput, setInitialKarmaInput] = useState(100);

  const filteredReputations = reputations.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    let cleanName = newUsername.trim();
    if (!cleanName.startsWith('u/')) {
      cleanName = 'u/' + cleanName;
    }

    onAddUser(cleanName, initialKarmaInput);
    setNewUsername('');
    setInitialKarmaInput(100);
  };

  const cardStyle = isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl' : 'bg-white border border-gray-100 text-gray-950 shadow-sm';
  const titleStyle = isDarkMode ? 'text-white' : 'text-gray-950';
  const descStyle = isDarkMode ? 'text-zinc-400' : 'text-gray-400';
  const labelStyle = isDarkMode ? 'text-zinc-300 font-semibold' : 'text-gray-750 font-bold';
  const inputStyle = isDarkMode 
    ? 'text-xs bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 font-mono outline-none focus:ring-1 focus:ring-orange-550 focus:bg-zinc-900 transition-all placeholder:text-zinc-650' 
    : 'text-xs bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 outline-none font-mono focus:ring-1 focus:ring-orange-200 focus:bg-white transition';

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
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
      id="reputation-panel" 
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Users table list column */}
      <motion.div 
        variants={itemVariants}
        className={`lg:col-span-8 rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-colors duration-300 ${cardStyle}`}
      >
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
          isDarkMode ? 'border-zinc-800' : 'border-gray-100'
        }`}>
          <div>
            <h2 className={`text-lg font-bold flex items-center gap-2 ${titleStyle}`}>
              <Award className="w-5 h-5 text-orange-500" />
              Subreddit User Karma Standing Registry
            </h2>
            <p className={`text-xs mt-1 ${descStyle}`}>
              Active Karma reputations cached by Reddit Devvit. High warning count auto-flags comments for manual moderator review.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64 max-w-xs">
            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${
              isDarkMode ? 'text-zinc-650' : 'text-gray-400'
            }`}>
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Filter by u/username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`text-xs w-full rounded-xl py-2 pl-9 pr-3 outline-none transition-all ${
                isDarkMode 
                  ? 'bg-zinc-950 border border-zinc-805 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-900 focus:ring-1 focus:ring-orange-500' 
                  : 'bg-gray-50 border border-gray-100 text-gray-700 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-200'
              }`}
            />
          </div>
        </div>

        {/* List table */}
        <div className={`overflow-x-auto rounded-2xl border pb-2 ${
          isDarkMode ? 'border-zinc-805' : 'border-gray-100'
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-bold transition-colors ${
                isDarkMode ? 'bg-zinc-950/60 border-zinc-805 text-zinc-400' : 'bg-gray-50 border-gray-100 text-gray-600'
              }`}>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Reddit Standing Karma</th>
                <th className="p-3.5 text-center">Toxicity Warn Count</th>
                <th className="p-3.5">App Trust State</th>
                <th className="p-3.5 text-right">Reputation Tools</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium transition-colors ${
              isDarkMode ? 'divide-zinc-800 text-zinc-350' : 'divide-gray-100 text-gray-750'
            }`}>
              {filteredReputations.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`text-center p-8 ${descStyle}`}>
                    No users matching criteria. Try creating a newUser.
                  </td>
                </tr>
              ) : (
                filteredReputations.map(user => (
                  <tr key={user.username} className={`transition-colors ${isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-gray-50'}`}>
                    <td className={`p-3.5 font-bold font-mono flex items-center gap-2 ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      {user.username}
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={user.reputationScore >= 100 ? 'text-green-500' : user.reputationScore < 0 ? 'text-red-500' : (isDarkMode ? 'text-zinc-300' : 'text-gray-650') }>
                        {user.reputationScore}
                      </span>
                    </td>
                    <td className={`p-3.5 text-center font-bold ${isDarkMode ? 'text-zinc-400' : 'text-gray-650'}`}>
                      {user.totalWarnings} / 3 max
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        user.status === 'clean' 
                          ? (isDarkMode ? 'bg-green-950/40 text-green-400 border-green-900/30' : 'bg-green-100 text-green-700 border-green-200') 
                          : user.status === 'warned'
                          ? (isDarkMode ? 'bg-yellow-950/40 text-yellow-400 border-yellow-900/30' : 'bg-yellow-100 text-yellow-800 border-yellow-200')
                          : user.status === 'shadowbanned'
                          ? (isDarkMode ? 'bg-purple-950/40 text-purple-400 border-purple-900/30' : 'bg-purple-100 text-purple-700 border-purple-200')
                          : (isDarkMode ? 'bg-red-950/40 text-red-400 border-red-900/30' : 'bg-red-100 text-red-700 border-red-200')
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {/* Interactive adjust stand controls */}
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => onAdjustKarma(user.username, 25)}
                          className={`px-2 py-1 rounded font-bold text-[10px] cursor-pointer transition ${
                            isDarkMode ? 'bg-green-950 text-green-400 hover:bg-green-900' : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          title="Boost user subreddit karma stand"
                        >
                          +25 Karma
                        </button>
                        <button
                          onClick={() => onAdjustKarma(user.username, -25)}
                          className={`px-2 py-1 rounded font-bold text-[10px] cursor-pointer transition ${
                            isDarkMode ? 'bg-orange-950 text-orange-400 hover:bg-orange-900' : 'bg-orange-50 text-orange-705 hover:bg-orange-100'
                          }`}
                          title="Deduct karma for minor issues"
                        >
                          -25 Karma
                        </button>
                        <select
                          value={user.status}
                          onChange={(e) => onUpdateStatus(user.username, e.target.value as any)}
                          className={`text-[10px] font-semibold border rounded px-1.5 py-1 outline-none cursor-pointer transition ${
                            isDarkMode 
                              ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-300 focus:border-orange-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border-gray-150 text-gray-700'
                          }`}
                        >
                          <option value="clean">Clean</option>
                          <option value="warned">Warned</option>
                          <option value="shadowbanned">Shadow</option>
                          <option value="banned">Ban</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Manual Insert User standing Column */}
      <motion.div 
        variants={itemVariants}
        className="lg:col-span-4 flex flex-col gap-6"
      >
        <div className={`rounded-3xl p-6 shadow-sm flex flex-col gap-5 transition-colors duration-300 ${cardStyle}`}>
          <div className={`border-b pb-3 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${titleStyle}`}>
              <Plus className="w-4 h-4 text-orange-500" />
              Register Standing Profile
            </h3>
            <p className={`text-xs mt-1 ${descStyle}`}>
              Add user custom standings in the r/Devvit database to seed edge-cases.
            </p>
          </div>

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs ${labelStyle}`}>Tester Username</label>
              <input 
                type="text" 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. u/NiceDeveloper"
                className={inputStyle}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={`text-xs ${labelStyle}`}>Initial Subreddit Standing Karma</label>
              <input 
                type="number" 
                value={initialKarmaInput}
                onChange={(e) => setInitialKarmaInput(parseInt(e.target.value) || 100)}
                placeholder="Karma Score"
                className={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll Profile Card
            </button>
          </form>
        </div>

        {/* Reputation Guidelines */}
        <div className={`rounded-3xl p-5 shadow-sm flex flex-col gap-3 text-xs transition-colors duration-300 ${cardStyle}`}>
          <h4 className={`font-bold flex items-center gap-1.5 ${titleStyle}`}>
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Integrity Protocols
          </h4>
          <ul className={`list-disc pl-4 space-y-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-550'}`}>
            <li>Users are warned when posting. Accumulating 3 warnings flips trust state to <strong className={isDarkMode ? 'text-red-400' : 'text-red-700'}>BANNED</strong>.</li>
            <li>Comments from <strong className={isDarkMode ? 'text-red-400' : 'text-red-700'}>BANNED</strong> users stand filtered from presentation channels.</li>
            <li>Bosting users with <strong className={isDarkMode ? 'text-green-400' : 'text-green-700'}>+25 Karma</strong> can override minor toxicity warnings gracefully.</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
