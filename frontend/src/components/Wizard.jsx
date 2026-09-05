import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function Wizard({ 
  bankBalance, setBankBalance, 
  item, setItem, 
  reason, setReason, 
  sadhyaMode, setSadhyaMode,
  malayaliMode, setMalayaliMode,
  onAnalyze 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState(null);
  const [manualPriceMode, setManualPriceMode] = useState(false);
  const [manualPrice, setManualPrice] = useState("");
  const [tempAnalysis, setTempAnalysis] = useState(null);

  const loadingMessages = [
    "Consulting the Uselessness Department...",
    "Questioning the purpose of this purchase...",
    "Measuring unnecessary expenditure...",
    "Consulting absolutely nobody...",
    "Calculating financial damage..."
  ];

  const handleNext = () => {
    if (step === 1 && (!bankBalance || isNaN(bankBalance) || Number(bankBalance) <= 0)) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (step === 2 && !item.trim()) {
      setError("Please tell us what you're buying.");
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    setError(null);
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please justify this terrible decision.");
      return;
    }
    setError(null);
    setLoading(true);

    // Fake loading steps
    let i = 0;
    setLoadingText(loadingMessages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < loadingMessages.length) setLoadingText(loadingMessages[i]);
    }, 1500);

    try {
      const analyzeRes = await axios.post(`${API_BASE}/analyze`, {
        item, reason, sadhyaMode, malayaliMode
      });
      const analysis = analyzeRes.data;
      
      clearInterval(interval);

      if (analysis.verdict === 'REJECTED') {
        setLoading(false);
        onAnalyze(analysis, null);
        return;
      }

      // If approved, try to get price
      try {
        setLoadingText("Searching for approximate market price...");
        const priceRes = await axios.post(`${API_BASE}/price`, { item });
        setLoading(false);
        onAnalyze(analysis, priceRes.data);
      } catch (priceErr) {
        setLoading(false);
        if (priceErr.response?.data?.requiresManual) {
          setTempAnalysis(analysis);
          setManualPriceMode(true);
        } else {
          setTempAnalysis(analysis);
          setManualPriceMode(true);
        }
      }

    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setError("Our Uselessness Evaluation Department is currently reconsidering its life choices. Please try again.");
    }
  };

  const handleManualPriceSubmit = () => {
    if (!manualPrice || isNaN(manualPrice) || Number(manualPrice) <= 0) {
      setError("Enter a valid price.");
      return;
    }
    onAnalyze(tempAnalysis, {
      estimated_price: Number(manualPrice),
      currency: "INR",
      source: "Manual Entry",
      confidence: "high"
    });
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <Loader2 size={48} className="animate-spin text-sadhya-gold mb-6" />
        <h2 className="text-2xl font-bold mb-2 animate-pulse">{loadingText}</h2>
        <p className="text-slate-400">Please wait while we judge you.</p>
      </motion.div>
    );
  }

  if (manualPriceMode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg bg-sadhya-card border border-white/10 rounded-2xl p-8 shadow-2xl">
        <AlertTriangle size={32} className="text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Can't find the price?</h2>
        <p className="text-slate-400 mb-6">Even the internet doesn't know how much this costs. Enter an estimated price manually to continue.</p>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 font-medium">₹</span>
          <input 
            type="number"
            value={manualPrice}
            onChange={e => setManualPrice(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-12 py-4 text-3xl font-bold outline-none focus:border-sadhya-gold transition-colors"
            placeholder="0"
          />
        </div>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button 
          onClick={handleManualPriceSubmit}
          className="w-full py-4 bg-sadhya-gold text-slate-900 font-bold rounded-xl text-lg hover:bg-yellow-400 transition-colors"
        >
          CONTINUE CALCULATION
        </button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex gap-2 items-center">
          {[1,2,3].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-12 bg-sadhya-gold' : 'w-4 bg-slate-700'}`} />
          ))}
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <input type="checkbox" checked={malayaliMode} onChange={e => setMalayaliMode(e.target.checked)} className="accent-sadhya-green w-4 h-4" />
            Malayali Mode
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <input type="checkbox" checked={sadhyaMode} onChange={e => setSadhyaMode(e.target.checked)} className="accent-sadhya-gold w-4 h-4" />
            Sadhya Mode <Sparkles size={14} className="text-sadhya-gold" />
          </label>
        </div>
      </div>

      <div className="bg-sadhya-card border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 w-full bg-red-500/20 border-b border-red-500/50 text-red-200 text-sm py-2 text-center font-medium">
            {error}
          </div>
        )}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-sm font-bold text-sadhya-green tracking-widest uppercase mb-2">Step 1 — Money</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">How much financial damage are we working with?</h3>
              <p className="text-slate-400 mb-8">Enter your current bank balance. We promise not to judge you.</p>
              
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-slate-400 font-medium group-focus-within:text-sadhya-gold transition-colors">₹</span>
                <input 
                  type="number"
                  value={bankBalance}
                  onChange={e => setBankBalance(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-16 py-6 text-5xl font-bold outline-none focus:border-sadhya-gold transition-colors placeholder:text-slate-700"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-sm font-bold text-sadhya-gold tracking-widest uppercase mb-2">Step 2 — Purchase</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">What completely unnecessary thing are you planning to buy?</h3>
              
              <div className="mt-8 relative">
                <input 
                  type="text"
                  value={item}
                  onChange={e => setItem(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-6 py-6 text-2xl font-medium outline-none focus:border-sadhya-gold transition-colors placeholder:text-slate-600"
                  placeholder="e.g. A tiny chair for my water bottle"
                  autoFocus
                />
              </div>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {["Banana-shaped phone stand", "Gold-plated paperclip", "A separate spoon exclusively for Maggi", "RGB toothbrush holder"].map((ex, i) => (
                  <button key={i} onClick={() => setItem(ex)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-300 transition-colors">
                    {ex}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-2">Step 3 — Justification</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">Why do you need this?</h3>
              
              <div className="mt-8 relative">
                <textarea 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full bg-slate-900 border-2 border-white/10 rounded-2xl px-6 py-6 text-xl font-medium outline-none focus:border-blue-400 transition-colors placeholder:text-slate-600 min-h-[200px] resize-none"
                  placeholder="Give us your most convincing justification for this terrible financial decision."
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex justify-between">
          <button 
            onClick={step === 1 ? () => window.location.reload() : handlePrev}
            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
          >
            {step === 1 ? "Cancel" : <><ChevronLeft size={20} /> Back</>}
          </button>
          
          <button 
            onClick={step === 3 ? handleSubmit : handleNext}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${step === 3 ? 'bg-gradient-to-r from-sadhya-gold to-orange-500 text-slate-900 shadow-lg hover:shadow-orange-500/25' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
          >
            {step === 3 ? "ANALYSE MY FINANCIAL MISTAKE" : "Continue"} {step !== 3 && <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
