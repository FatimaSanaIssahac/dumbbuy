'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Volume2, VolumeX, Key, Flame } from 'lucide-react';
import { sounds } from '@/lib/audio';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal, hasCustomKey }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(!sounds.isEnabled());
  }, []);

  const handleToggleSound = () => {
    const isNowEnabled = sounds.toggleMute();
    setIsMuted(!isNowEnabled);
    if (isNowEnabled) {
      sounds.playClick();
    }
  };

  return (
    <header className="w-full max-w-5xl mx-auto pt-6 pb-4 px-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-lg shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              CAN I AFFORD THIS?
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Absurdity Calculator
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Let&apos;s find out how many terrible financial decisions you can make.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 transition-all text-xs flex items-center gap-1.5"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Sound On</span>
            </>
          )}
        </button>

        {/* API Key Modal Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onOpenApiKeyModal();
          }}
          className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            hasCustomKey
              ? 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
              : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-700/60 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>{hasCustomKey ? 'AI Model Active' : 'AI Settings (OpenAI / Gemini)'}</span>
          {hasCustomKey && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          )}
        </button>
      </div>
    </header>
  );
};
