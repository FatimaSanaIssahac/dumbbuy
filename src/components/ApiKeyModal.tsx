'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/audio';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [apiKey, setApiKey] = useState(currentKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(currentKey);
  }, [currentKey]);

  if (!isOpen) return null;

  const isCurrentOpenAI = apiKey.trim().startsWith('sk-');
  const isCurrentGemini = apiKey.trim().startsWith('AIza');

  const handleSave = () => {
    sounds.playClick();
    onSaveKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    sounds.playClick();
    setApiKey('');
    onSaveKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700 font-sans">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">AI Model & Web Search Setup</h3>
            <p className="text-xs text-slate-400">Connect OpenAI (GPT-4o) or Google Gemini</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 mb-5 leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Dual AI Engine Supported!</span>
          </div>
          <p className="text-slate-400">
            Paste either your <strong className="text-white">OpenAI API Key</strong> (starts with <code className="text-pink-300">sk-</code>) or your <strong className="text-white">Google Gemini API Key</strong> (starts with <code className="text-purple-300">AIza</code>). The app automatically detects the provider!
          </p>
        </div>

        {/* Key Input */}
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Your API Key
            </label>
            {isCurrentOpenAI && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                OpenAI (GPT-4o-mini) Detected
              </span>
            )}
            {isCurrentGemini && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Gemini 1.5 Flash Detected
              </span>
            )}
          </div>
          
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste sk-proj-... or AIzaSy..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-mono"
          />

          {/* Quick links to obtain keys */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center">
              <span>Need an <strong>OpenAI</strong> key?</span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>OpenAI Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex justify-between items-center">
              <span>Need a <strong>Free Gemini</strong> key? (No credit card)</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved & Activated!</span>
              </>
            ) : (
              <span>Save & Use AI Model</span>
            )}
          </button>

          {currentKey && (
            <button
              onClick={handleClear}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Clear Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
