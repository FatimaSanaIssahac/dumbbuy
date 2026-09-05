'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PurchaseForm } from '@/components/PurchaseForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { TooUsefulOutcome } from '@/components/TooUsefulOutcome';
import { UselessEnoughOutcome } from '@/components/UselessEnoughOutcome';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { JudgeResponse } from '@/lib/types';
import { Sparkles, ShieldAlert, CheckCircle2, ShieldX } from 'lucide-react';
import { DEFAULT_CURRENCY } from '@/lib/currencies';

export default function Home() {
  const [result, setResult] = useState<JudgeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [lastBalance, setLastBalance] = useState<number>(10000);
  const [lastCurrency, setLastCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [formItem, setFormItem] = useState<string>('');
  const [formReason, setFormReason] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) {
      setUserApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleEvaluate = async (data: {
    balance: number;
    currency: string;
    item: string;
    reason: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setLastBalance(data.balance);
    setLastCurrency(data.currency);
    setFormItem(data.item);
    setFormReason(data.reason);

    try {
      const res = await fetch('/api/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balance: data.balance,
          currency: data.currency,
          item: data.item,
          reason: data.reason,
          apiKey: userApiKey,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze purchase');
      }

      setResult(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 bg-[#0b0f19]">
      {/* Top Header */}
      <Header
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasCustomKey={Boolean(userApiKey)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
        {/* Hero Section if on input page */}
        {!result && !isLoading && (
          <div className="text-center mb-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>The Anti-Financial-Advice Engine</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
              CAN I AFFORD THIS?
            </h1>

            <p className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-400 mb-2">
              Let&apos;s find out how many terrible financial decisions you can make.
            </p>

            <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
              Tell us your bank balance, the completely unnecessary item you desire, and why you need it.
              Sensible purchases are rejected on sight. Truly useless ones are calculated for maximum hoarding capacity.
            </p>
          </div>
        )}

        {/* Loading State with humorous progression */}
        {isLoading && <LoadingScreen />}

        {/* Error Notification */}
        {error && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-rose-400 hover:text-rose-200 font-bold px-2 py-1 ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form or Result Outcomes */}
        {!isLoading && (
          <>
            {!result && (
              <>
                <PurchaseForm
                  onSubmit={handleEvaluate}
                  isLoading={isLoading}
                  initialItem={formItem}
                  initialReason={formReason}
                  initialBalance={lastBalance}
                  initialCurrency={lastCurrency}
                />

                {/* Outcome Guide Cards */}
                <div className="w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                      <ShieldX className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                        Outcome 1: Too Useful 🛑
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        &quot;Laptops for college, groceries, winter coats.&quot;
                      </p>
                      <span className="text-[11px] text-rose-400/90 italic block mt-0.5">
                        Verdict: Rejected for being far too sensible.
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/30 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Outcome 2: Useless Enough 🚀
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        &quot;A tiny umbrella for my water bottle.&quot;
                      </p>
                      <span className="text-[11px] text-emerald-400/90 italic block mt-0.5">
                        Verdict: Approved! Calculates how many you can hoard.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* OUTCOME 1: TOO USEFUL */}
            {result && result.outcome === 'TOO_USEFUL' && (
              <TooUsefulOutcome
                response={result}
                onReset={handleReset}
              />
            )}

            {/* OUTCOME 2: USELESS ENOUGH */}
            {result && result.outcome === 'USELESS_ENOUGH' && (
              <UselessEnoughOutcome
                response={result}
                initialBalance={lastBalance}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto py-6 px-4 text-center text-xs text-slate-500 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          Can I Afford This? &bull; For satire and comedy only. Not legitimate financial advice.
        </p>
        <p className="flex items-center gap-1.5">
          <span>Uselessness Threshold:</span>
          <span className="text-amber-400 font-bold">70 / 100</span>
          <span>&bull; Currency Default:</span>
          <span className="text-emerald-400 font-bold">INR (₹)</span>
        </p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={userApiKey}
      />
    </div>
  );
}
