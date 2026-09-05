'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  'Consulting the financial gods…',
  'Evaluating the usefulness…',
  'Questioning your life choices…',
  'Searching e-commerce indexes for unit pricing…',
  'Checking if your bank account is weeping…',
  'Calculating your hoard capacity…',
];

export const LoadingScreen: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto glass-panel rounded-3xl p-8 md:p-12 text-center border border-amber-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-1 flex items-center justify-center mb-6 shadow-xl shadow-rose-950/50 animate-bounce">
        <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
          <BrainCircuit className="w-10 h-10 text-amber-400 animate-spin-slow" />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight flex items-center justify-center gap-2">
        <span>Judging Your Financial Life</span>
        <Sparkles className="w-4 h-4 text-amber-400" />
      </h3>

      <div className="h-10 flex items-center justify-center">
        <p className="text-base text-amber-300 font-bold transition-all duration-300 animate-fade-in">
          {LOADING_MESSAGES[currentMessageIndex]}
        </p>
      </div>

      <div className="w-56 h-2 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500 rounded-full animate-pulse" />
      </div>
      <p className="text-xs text-slate-500 mt-3">
        Hold onto your wallet. This may sting.
      </p>
    </div>
  );
};
