'use client';

import React, { useState } from 'react';
import { Sparkles, Dices, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY, getCurrencyConfig } from '@/lib/currencies';
import { FUNNY_PRESETS } from '@/lib/verdicts';
import { PresetItem } from '@/lib/types';
import { sounds } from '@/lib/audio';

interface PurchaseFormProps {
  onSubmit: (data: { balance: number; currency: string; item: string; reason: string }) => void;
  isLoading: boolean;
  initialItem?: string;
  initialReason?: string;
  initialBalance?: number;
  initialCurrency?: string;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  onSubmit,
  isLoading,
  initialItem = '',
  initialReason = '',
  initialBalance = 10000,
  initialCurrency = DEFAULT_CURRENCY,
}) => {
  const [balance, setBalance] = useState<string>(initialBalance.toString());
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [item, setItem] = useState<string>(initialItem);
  const [reason, setReason] = useState<string>(initialReason);
  const [error, setError] = useState<string | null>(null);

  // Random preset picker for instant entertainment
  const handleRandomize = () => {
    sounds.playClick();
    const randomIndex = Math.floor(Math.random() * FUNNY_PRESETS.length);
    const preset: PresetItem = FUNNY_PRESETS[randomIndex];
    setBalance(preset.balance.toString());
    setCurrency(preset.currency);
    setItem(preset.item);
    setReason(preset.reason);
    setError(null);
  };

  const handleSelectPreset = (preset: PresetItem) => {
    sounds.playClick();
    setBalance(preset.balance.toString());
    setCurrency(preset.currency);
    setItem(preset.item);
    setReason(preset.reason);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    setError(null);

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance <= 0) {
      setError('Please enter a valid bank balance greater than 0.');
      return;
    }

    if (!item.trim()) {
      setError('Please tell us what completely unnecessary thing you want to buy!');
      return;
    }

    if (!reason.trim()) {
      setError('Please explain why you think you need this in your life.');
      return;
    }

    onSubmit({
      balance: numBalance,
      currency,
      item: item.trim(),
      reason: reason.trim(),
    });
  };

  const currentConfig = getCurrencyConfig(currency);

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-700/60 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header bar with Randomizer */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            <span>The Financial Reckoning</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400">
            Tell us how much you have and what madness you wish to acquire.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-semibold transition-all transform active:scale-95 shadow-sm"
          title="Fills in a funny randomized purchase scenario"
        >
          <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>Surprise Me</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* INPUT 1: Bank Balance */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 flex items-center justify-between">
            <span>1. How much money is currently in your bank account?</span>
            <span className="text-[11px] text-amber-400/90 font-medium">
              INR default (₹)
            </span>
          </label>
          <div className="flex rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/90 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30 transition-all">
            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-800 text-slate-200 font-bold px-3 py-3.5 border-r border-slate-700 outline-none text-sm cursor-pointer hover:bg-slate-750"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            {/* Numeric balance input */}
            <div className="relative flex-1 flex items-center">
              <span className="pl-3.5 pr-1 text-slate-400 font-bold">
                {currentConfig.symbol}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full bg-transparent py-3.5 pr-4 text-white text-base font-bold placeholder:text-slate-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* INPUT 2: Thing You Want To Buy */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
            2. What completely unnecessary thing are you thinking of buying?
          </label>
          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="A tiny umbrella for my water bottle"
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-400/80" />
            Warning: Truly practical purchases (groceries, laptops for work, bills) will be rejected.
          </p>
        </div>

        {/* INPUT 3: Why You Want To Buy It */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
            3. Why do you need this?
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Because my water bottle might get wet."
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3.5 text-white text-sm font-medium placeholder:text-slate-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 outline-none resize-none transition-all"
          />
        </div>

        {/* Quick Sample Presets */}
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            Or try one of these questionable dilemmas:
          </span>
          <div className="flex flex-wrap gap-2">
            {FUNNY_PRESETS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
              >
                {p.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-shake">
            {error}
          </div>
        )}

        {/* The large “Judge My Purchase” button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 text-white font-black text-lg tracking-wider shadow-xl shadow-rose-900/30 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Consulting the Financial Gods...</span>
            </>
          ) : (
            <>
              <span>JUDGE MY PURCHASE</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
