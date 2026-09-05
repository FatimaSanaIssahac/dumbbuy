import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, XCircle, CheckCircle, TrendingDown, AlertTriangle } from 'lucide-react';

export default function ResultCard({ analysisResult, priceData, bankBalance, onReset, sadhyaMode }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const isApproved = analysisResult.verdict === 'APPROVED';

  if (!isApproved) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-red-950/40 border-2 border-red-500/30 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_50px_-10px_rgba(239,68,68,0.3)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
        <XCircle size={80} className="text-red-500 mx-auto mb-6" />
        <h2 className="text-4xl font-black text-red-400 mb-2 tracking-tight">PURCHASE REJECTED</h2>
        <h3 className="text-2xl font-bold text-white mb-8">THIS IS TOO USEFUL TO BE TRUE.</h3>
        
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1 uppercase tracking-wider font-bold">Usefulness</div>
            <div className="text-3xl font-black text-red-400">{analysisResult.usefulness_score}/100</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-1 uppercase tracking-wider font-bold">Uselessness</div>
            <div className="text-3xl font-black text-slate-300">{analysisResult.uselessness_score}/100</div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 mb-8 text-left text-lg leading-relaxed text-slate-300">
          "{analysisResult.reasoning}"
        </div>

        <button 
          onClick={onReset}
          className="px-8 py-4 bg-white text-red-950 font-bold rounded-xl text-lg hover:bg-slate-200 transition-colors w-full flex items-center justify-center gap-2"
        >
          <RefreshCcw size={20} /> TRY SOMETHING MORE USELESS
        </button>
      </motion.div>
    );
  }

  // Approved Flow
  const balance = Number(bankBalance);
  const price = priceData ? priceData.estimated_price : 0;
  
  let quantity = 0;
  let remaining = balance;
  
  if (price > 0) {
    quantity = Math.floor(balance / price);
    remaining = balance - (quantity * price);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl"
    >
      <div className="text-center mb-10">
        <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-4">THE VERDICT</h2>
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          className="flex justify-center mb-4"
        >
          <div className="bg-sadhya-green/20 text-sadhya-green border border-sadhya-green/30 px-6 py-2 rounded-full font-black text-4xl flex items-center gap-3">
            APPROVED <CheckCircle size={36} />
          </div>
        </motion.div>
        <p className="text-xl text-slate-300">Your purchase has passed the Uselessness Evaluation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricBox 
          label={sadhyaMode ? "Sadhya Compatibility" : "Uselessness Score"}
          value={`${analysisResult.uselessness_score} / 100`}
          highlight={true}
        />
        <MetricBox 
          label="Estimated Price" 
          value={price > 0 ? formatMoney(price) : "UNKNOWN"} 
          sub={priceData?.source === 'Manual Entry' ? "Manual Entry" : "Price may vary because even useless things have inflation."}
        />
        <MetricBox label="Your Balance" value={formatMoney(balance)} />
        <MetricBox label="Remaining Balance" value={formatMoney(remaining)} />
      </div>

      {price > 0 ? (
        <div className="bg-gradient-to-br from-sadhya-card to-slate-900 border border-white/10 rounded-3xl p-10 text-center mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10">
            <TrendingDown size={200} />
          </div>
          <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-4">Maximum Purchase Capacity</h3>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-6"
          >
            {quantity}
          </motion.div>
          
          <div className="bg-sadhya-gold/10 border border-sadhya-gold/20 text-sadhya-gold p-4 rounded-xl inline-block font-bold text-xl mb-4">
            YOUR FINANCIAL POTENTIAL: {quantity} USELESS OBJECTS
          </div>
          
          {quantity > 0 ? (
            <p className="text-slate-400 text-lg">
              You have successfully converted {formatMoney(balance - remaining)} into {quantity} objects nobody asked for.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-red-400 text-lg font-bold">You cannot afford even one.</p>
              <p className="text-slate-400">But congratulations. Your financial situation has prevented an unnecessary purchase.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-sadhya-card border border-white/10 rounded-3xl p-10 text-center mb-6 shadow-2xl">
           <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
           <p className="text-xl">We couldn't calculate how many you can buy because the price is unknown.</p>
           <p className="text-slate-400 mt-2">But rest assured, it remains highly useless.</p>
        </div>
      )}

      <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-8 mb-10 relative">
        <div className="absolute -top-3 left-8 bg-slate-900 px-2 text-xs font-bold tracking-widest text-slate-500 uppercase">AI Roast</div>
        <p className="text-xl italic text-slate-300 leading-relaxed">"{analysisResult.roast}"</p>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onReset}
          className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-lg transition-colors flex items-center gap-2"
        >
          <RefreshCcw size={20} /> OPTIMIZE MORE MONEY
        </button>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-2xl p-6 border ${highlight ? 'bg-sadhya-gold/5 border-sadhya-gold/30' : 'bg-sadhya-card border-white/5'}`}>
      <div className={`text-sm font-bold tracking-wider uppercase mb-2 ${highlight ? 'text-sadhya-gold' : 'text-slate-400'}`}>
        {label}
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-2 mt-2 leading-tight">{sub}</div>}
    </div>
  );
}
