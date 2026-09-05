'use client';

import React, { useState } from 'react';
import { X, Check, DollarSign } from 'lucide-react';
import { formatCurrency, getCurrencyConfig } from '@/lib/currencies';
import { sounds } from '@/lib/audio';

interface ManualPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePrice: (newPrice: number) => void;
  currentPrice: number;
  currency: string;
  item: string;
}

export const ManualPriceModal: React.FC<ManualPriceModalProps> = ({
  isOpen,
  onClose,
  onSavePrice,
  currentPrice,
  currency,
  item,
}) => {
  const [priceInput, setPriceInput] = useState(currentPrice.toString());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = getCurrencyConfig(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(priceInput);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    sounds.playClick();
    onSavePrice(val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          Adjust Item Price Manually
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Did the internet get the price wrong for &ldquo;{item}&rdquo;? Enter the real price below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Price in {config.code} ({config.symbol})
            </label>
            <div className="flex rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/30">
              <span className="px-4 py-3 bg-slate-800 text-slate-300 font-bold border-r border-slate-700">
                {config.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-white text-base font-bold outline-none"
                placeholder="Enter price"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-semibold">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Update Price</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
