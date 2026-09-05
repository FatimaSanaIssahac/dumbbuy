import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, TrendingDown, Infinity, Users } from 'lucide-react';

export default function Hero({ onStart }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="flex flex-col items-center text-center max-w-4xl"
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
    >
      <motion.div variants={item} className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sadhya-gold/10 border border-sadhya-gold/20 text-sadhya-gold text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sadhya-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-sadhya-gold"></span>
        </span>
        New: Sadhya Mode v2.0
      </motion.div>
      
      <motion.h1 variants={item} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
        Optimizing your money for <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sadhya-gold to-orange-400">
          absolutely no reason.
        </span>
      </motion.h1>
      
      <motion.p variants={item} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
        Tell us what you want to buy, why you want it, and how much money you have. 
        Our highly unnecessary AI will determine whether your purchase is useless enough to deserve funding.
      </motion.p>
      
      <motion.button 
        variants={item}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        className="group relative px-8 py-4 bg-sadhya-green text-white font-bold rounded-xl text-lg shadow-[0_0_40px_-10px_rgba(21,128,61,0.5)] overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          OPTIMIZE MY MONEY <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      </motion.button>

      <motion.div variants={item} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-white/5 pt-12">
        <MetricCard icon={<Activity className="text-sadhya-green" />} value="₹0" label="Useful purchases funded" />
        <MetricCard icon={<Infinity className="text-sadhya-gold" />} value="∞" label="Uselessness potential" />
        <MetricCard icon={<TrendingDown className="text-red-400" />} value="100%" label="Unnecessary calculations" />
        <MetricCard icon={<Users className="text-blue-400" />} value="0" label="People who asked for this" />
      </motion.div>
    </motion.div>
  );
}

function MetricCard({ icon, value, label }) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-slate-800/30 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="p-3 bg-slate-900 rounded-xl mb-3 shadow-inner">
        {icon}
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}
