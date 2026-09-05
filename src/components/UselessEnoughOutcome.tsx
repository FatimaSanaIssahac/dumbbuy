'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, Edit3, ExternalLink, Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import { JudgeResponse, ProductPriceResult, AffordabilityResult } from '@/lib/types';
import { formatCurrency } from '@/lib/currencies';
import { calculateAffordability } from '@/lib/affordability';
import { generateDynamicQuotes } from '@/lib/verdicts';
import { sounds } from '@/lib/audio';
import { ManualPriceModal } from './ManualPriceModal';

interface UselessEnoughOutcomeProps {
  response: JudgeResponse;
  initialBalance: number;
  onReset: () => void;
}

export const UselessEnoughOutcome: React.FC<UselessEnoughOutcomeProps> = ({
  response,
  initialBalance,
  onReset,
}) => {
  const { judgement, item, reason, currency, currencySymbol } = response;

  const [currentPricing, setCurrentPricing] = useState<ProductPriceResult>(
    response.pricing || {
      price: 500,
      currency,
      currencySymbol,
      productTitle: item,
      source: 'Retail Market Index',
      isEstimated: true,
      searchQuery: `${item} price`,
    }
  );

  const [currentAffordability, setCurrentAffordability] = useState<AffordabilityResult>(
    response.affordability || calculateAffordability(initialBalance, 500, currency)
  );

  const [quotes, setQuotes] = useState<string[]>(
    response.quotes.length > 0
      ? response.quotes
      : generateDynamicQuotes(item, currentAffordability.quantity, initialBalance, currentPricing.price, currency)
  );

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Fire confetti and play triumph sound on mount
  useEffect(() => {
    sounds.playSuccess();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6'],
      });
    } catch {
      // Ignore if canvas unsupported
    }
  }, []);

  const handleUpdatePrice = (newPrice: number) => {
    const updatedPricing: ProductPriceResult = {
      ...currentPricing,
      price: newPrice,
      source: 'Manually Specified by User',
      isEstimated: false,
    };
    setCurrentPricing(updatedPricing);

    const updatedAffordability = calculateAffordability(initialBalance, newPrice, currency);
    setCurrentAffordability(updatedAffordability);

    const updatedQuotes = generateDynamicQuotes(
      item,
      updatedAffordability.quantity,
      initialBalance,
      newPrice,
      currency
    );
    setQuotes(updatedQuotes);
  };

  const { quantity, remainingBalance, deficit, isUnaffordable, isSingleItem, headline, subtext } = currentAffordability;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Celebration Banner Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 border border-amber-500/40 bg-slate-900/90 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Uselessness Score Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wider uppercase">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Terrible Decision Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Uselessness Score:</span>
            <span className="text-sm font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950">
              {judgement.uselessness_score}/100
            </span>
          </div>
        </div>

        {/* The Exact Celebration Title Requested */}
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 tracking-tight">
            CONGRATULATIONS. THIS IS USELESS ENOUGH.
          </h2>
          <p className="text-base text-slate-300 font-medium">
            Financial responsibility has officially left the building.
          </p>
        </div>

        {/* AI Judgement / Why It's Useless */}
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Verdict: {judgement.verdict}
          </span>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{judgement.reasoning}&rdquo;
          </p>
        </div>

        {/* Price Search & Unit Pricing Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase block">
                Found Product & Source
              </span>
              <span className="text-sm font-bold text-slate-200">
                {currentPricing.productTitle}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Source: {currentPricing.source}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Unit Price</span>
                <span className="text-lg font-black text-amber-400">
                  {formatCurrency(currentPricing.price, currency)}
                </span>
              </div>
              <button
                onClick={() => setIsManualModalOpen(true)}
                title="Adjust price manually"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {currentPricing.isEstimated && (
            <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Exact item not found in local inventory; using an estimated price for a similar product.
              </span>
            </div>
          )}
        </div>

        {/* THE MAIN CALCULATION DISPLAY */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-purple-600/20 border border-amber-500/40 text-center my-6 shadow-inner space-y-4">
          {isUnaffordable ? (
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-rose-400 block">
                AFFORDABILITY REALITY CHECK
              </span>
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                YOU CAN&apos;T EVEN AFFORD ONE.
              </h3>
              <p className="text-sm md:text-base text-rose-300 font-bold">
                You need {formatCurrency(deficit, currency)} more to afford this mistake.
              </p>
              <p className="text-xs text-slate-400">
                Bank Balance: {formatCurrency(initialBalance, currency)} &bull; Item Price: {formatCurrency(currentPricing.price, currency)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">
                MAXIMUM HOARD CAPACITY
              </span>

              {/* Big Quantity Number */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl md:text-8xl font-black tracking-tight text-white drop-shadow-md">
                  {quantity.toLocaleString()}
                </span>
              </div>

              {/* Headline & Subtext */}
              <h3 className="text-lg md:text-2xl font-black text-amber-300">
                {headline}
              </h3>
              <p className="text-sm font-semibold text-slate-300">
                {subtext}
              </p>

              {/* Remaining Balance display as required: ₹0 remaining */}
              <div className="pt-4 border-t border-amber-500/20 flex items-center justify-center gap-4 text-sm font-bold">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="text-emerald-400 text-lg">
                  {formatCurrency(remainingBalance, currency)} remaining
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Satirical Quotes Carousel / Highlights */}
        <div className="space-y-2 mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Financial Commentary
          </span>
          <div className="grid grid-cols-1 gap-2">
            {quotes.slice(0, 3).map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs md:text-sm font-medium text-slate-300 flex items-center gap-2.5"
              >
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Judge Another Purchase */}
        <button
          onClick={() => {
            sounds.playClick();
            onReset();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:via-rose-400 hover:to-purple-500 text-white font-black text-base tracking-wide shadow-xl shadow-rose-950/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
        >
          <RotateCcw className="w-5 h-5 text-white" />
          <span>Judge Another Purchase</span>
        </button>
      </div>

      {/* Manual Price Override Modal */}
      <ManualPriceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSavePrice={handleUpdatePrice}
        currentPrice={currentPricing.price}
        currency={currency}
        item={item}
      />
    </div>
  );
};
