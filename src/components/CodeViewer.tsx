/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Copy, Check, Terminal, FileCode, Landmark, GitPullRequest } from 'lucide-react';
import { DEVVIT_CODE_TEMPLATES } from '../code-templates';

interface CodeViewerProps {
  isDarkMode?: boolean;
}

export default function CodeViewer({ isDarkMode = false }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'helpers' | 'readme' | 'deployment'>('main');
  const [copied, setCopied] = useState(false);

  const getCodeContent = () => {
    switch (activeTab) {
      case 'main':
        return DEVVIT_CODE_TEMPLATES.main;
      case 'helpers':
        return DEVVIT_CODE_TEMPLATES.helpers;
      case 'readme':
        return DEVVIT_CODE_TEMPLATES.readme;
      case 'deployment':
        return DEVVIT_CODE_TEMPLATES.deployment;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardStyle = isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xl' : 'bg-white border border-gray-100 text-gray-950 shadow-sm';
  const titleStyle = isDarkMode ? 'text-white' : 'text-gray-950';
  const descStyle = isDarkMode ? 'text-zinc-400' : 'text-gray-400';
  const preBgStyle = isDarkMode ? 'bg-zinc-950 border border-zinc-805/70' : 'bg-gray-55 border border-gray-100';
  const preTextColor = isDarkMode ? 'text-zinc-250' : 'text-gray-800';

  return (
    <div id="code-viewer-panel" className={`rounded-3xl p-6 flex flex-col gap-6 transition-colors duration-300 ${cardStyle}`}>
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 ${
        isDarkMode ? 'border-zinc-800' : 'border-gray-150'
      }`}>
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${titleStyle}`}>
            <Terminal className="w-5 h-5 text-indigo-500" />
            Devvit Native Production-Ready Source Code
          </h2>
          <p className={`text-xs mt-1 ${descStyle}`}>
            Complete, fully documented, clean TypeScript code ready to be pasted directly into a new `@devvit/cli` workspace.
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          id="copy-code-btn"
          className={`px-4 py-2 cursor-pointer rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all border ${
            isDarkMode 
              ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-900/40' 
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Code Block
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Left Sidebar */}
        <div className="md:col-span-3 flex flex-col gap-2">
          {/* Main.tsx */}
          <button
            onClick={() => setActiveTab('main')}
            className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-xs font-bold ${
              activeTab === 'main' 
                ? (isDarkMode ? 'bg-indigo-950/40 text-indigo-300 shadow-sm border-l-4 border-l-indigo-500' : 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-l-indigo-600') 
                : (isDarkMode ? 'text-zinc-450 hover:bg-zinc-800/40 hover:text-zinc-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950')
            }`}
          >
            <FileCode className="w-4 h-4" />
            <div className="flex flex-col gap-0.5">
              <span>src/main.tsx</span>
              <span className={`text-[10px] font-normal ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Core Devvit App Triggers</span>
            </div>
          </button>

          {/* Helpers.ts */}
          <button
            onClick={() => setActiveTab('helpers')}
            className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-xs font-bold ${
              activeTab === 'helpers' 
                ? (isDarkMode ? 'bg-indigo-950/40 text-indigo-300 shadow-sm border-l-4 border-l-indigo-500' : 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-l-indigo-600') 
                : (isDarkMode ? 'text-zinc-450 hover:bg-zinc-800/40 hover:text-zinc-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950')
            }`}
          >
            <FileCode className="w-4 h-4" />
            <div className="flex flex-col gap-0.5">
              <span>src/helpers.ts</span>
              <span className={`text-[10px] font-normal ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Utility Helpers & Checks</span>
            </div>
          </button>

          {/* README.md */}
          <button
            onClick={() => setActiveTab('readme')}
            className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-xs font-bold ${
              activeTab === 'readme' 
                ? (isDarkMode ? 'bg-indigo-950/40 text-indigo-300 shadow-sm border-l-4 border-l-indigo-500' : 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-l-indigo-600') 
                : (isDarkMode ? 'text-zinc-450 hover:bg-zinc-800/40 hover:text-zinc-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950')
            }`}
          >
            <FileText className="w-4 h-4" />
            <div className="flex flex-col gap-0.5">
              <span>README.md</span>
              <span className={`text-[10px] font-normal ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Setup Instructions</span>
            </div>
          </button>

          {/* Deployment */}
          <button
            onClick={() => setActiveTab('deployment')}
            className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer text-xs font-bold ${
              activeTab === 'deployment' 
                ? (isDarkMode ? 'bg-indigo-950/40 text-indigo-300 shadow-sm border-l-4 border-l-indigo-500' : 'bg-indigo-50 text-indigo-700 shadow-sm border-l-4 border-l-indigo-600') 
                : (isDarkMode ? 'text-zinc-450 hover:bg-zinc-800/40 hover:text-zinc-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950')
            }`}
          >
            <GitPullRequest className="w-4 h-4" />
            <div className="flex flex-col gap-0.5">
              <span>Deploy.md</span>
              <span className={`text-[10px] font-normal ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Production Cloud Run Setup</span>
            </div>
          </button>
        </div>

        {/* Source Code Container Frame */}
        <div className="md:col-span-9">
          <div className={`rounded-3xl p-5 shadow-inner select-all transition-colors ${preBgStyle}`}>
            <pre className={`text-xs leading-relaxed font-mono whitespace-pre overflow-x-auto max-h-[500px] ${preTextColor}`}>
              <code>{getCodeContent()}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
