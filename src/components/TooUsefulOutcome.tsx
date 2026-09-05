'use client';

import React, { useEffect } from 'react';
import { ShieldX, AlertOctagon, RotateCcw, Frown, ThumbsDown } from 'lucide-react';
import { JudgeResponse } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface TooUsefulOutcomeProps {
  response: JudgeResponse;
  onReset: () => void;
}

export const TooUsefulOutcome: React.FC<TooUsefulOutcomeProps> = ({ response, onReset }) => {
  const { judgement, item, reason, quotes } = response;

  useEffect(() => {
    sounds.playSadTrombone();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Bureaucratic / Disappointed Container */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 border border-rose-900/50 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        {/* Disappointed Slanted Stamp */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 rotate-12 z-10 select-none pointer-events-none">
          <div className="border-4 border-rose-500/80 rounded-2xl px-4 py-2 bg-rose-950/80 backdrop-blur-md shadow-xl animate-shake">
            <span className="text-xl md:text-2xl font-black tracking-widest text-rose-400 uppercase">
              REJECTED 🛑
            </span>
          </div>
        </div>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6">
          <Frown className="w-8 h-8 text-rose-400" />
        </div>

        {/* Dramatic Headline as explicitly requested */}
        <div className="space-y-2 mb-6">
          <h2 className="text-3xl md:text-5xl font-black text-rose-400 tracking-tight">
            TOO USEFUL.
          </h2>
          <p className="text-lg md:text-xl font-bold text-slate-200">
            “Sorry. This purchase has been rejected for being far too sensible.”
          </p>
        </div>

        {/* AI Explanation Callout */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" />
              AI Judgement Breakdown
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-bold">
              Uselessness: {judgement.uselessness_score}/100 ({judgement.tier})
            </span>
          </div>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed italic">
            &ldquo;{judgement.reasoning}&rdquo;
          </p>
        </div>

        {/* The User's Sensible Purchase details */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 mb-6 text-xs text-slate-400">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-500 uppercase">Sensible Item:</span>
            <span className="font-bold text-slate-200 text-sm">{item}</span>
          </div>
          <div className="flex justify-between items-start pt-1">
            <span className="font-semibold text-slate-500 uppercase">Your Justification:</span>
            <span className="font-medium text-slate-300 text-right max-w-xs">{reason}</span>
          </div>
        </div>

        {/* Sarcastic commentary */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs md:text-sm font-medium flex items-center gap-3 mb-8">
          <ThumbsDown className="w-5 h-5 text-rose-400 shrink-0" />
          <span>
            {quotes[0] || 'Pragmatism detected. Our anti-financial advisors are deeply disappointed.'}
          </span>
        </div>

        {/* Action Button: Judge Another Purchase */}
        <button
          onClick={() => {
            sounds.playClick();
            onReset();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base tracking-wide border border-slate-600 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] shadow-lg"
        >
          <RotateCcw className="w-5 h-5 text-amber-400" />
          <span>Judge Another Purchase (Try Something Dumber)</span>
        </button>
      </div>
    </div>
  );
};
