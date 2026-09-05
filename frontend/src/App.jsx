import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import Wizard from './components/Wizard';
import ResultCard from './components/ResultCard';
import Navbar from './components/Navbar';

function App() {
  const [step, setStep] = useState('hero'); // hero, wizard, loading, result
  const [bankBalance, setBankBalance] = useState('');
  const [item, setItem] = useState('');
  const [reason, setReason] = useState('');
  const [sadhyaMode, setSadhyaMode] = useState(false);
  const [malayaliMode, setMalayaliMode] = useState(false);
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [priceData, setPriceData] = useState(null);
  
  const resetApp = () => {
    setStep('hero');
    setBankBalance('');
    setItem('');
    setReason('');
    setAnalysisResult(null);
    setPriceData(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-sadhya-gold selection:text-slate-900 flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sadhya-green/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-sadhya-gold/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-5xl mx-auto z-10 relative mt-16">
        <AnimatePresence mode="wait">
          {step === 'hero' && (
            <Hero key="hero" onStart={() => setStep('wizard')} />
          )}
          {step === 'wizard' && (
            <Wizard 
              key="wizard"
              bankBalance={bankBalance} setBankBalance={setBankBalance}
              item={item} setItem={setItem}
              reason={reason} setReason={setReason}
              sadhyaMode={sadhyaMode} setSadhyaMode={setSadhyaMode}
              malayaliMode={malayaliMode} setMalayaliMode={setMalayaliMode}
              onAnalyze={(result, pData) => {
                setAnalysisResult(result);
                setPriceData(pData);
                setStep('result');
              }}
            />
          )}
          {step === 'result' && (
            <ResultCard 
              key="result"
              analysisResult={analysisResult}
              priceData={priceData}
              bankBalance={bankBalance}
              onReset={resetApp}
              sadhyaMode={sadhyaMode}
            />
          )}
        </AnimatePresence>
      </main>
      
      <footer className="py-6 text-center text-slate-500 text-sm z-10">
        <p>This is a parody project. Price estimates are approximate and this application does not provide financial advice.</p>
        <p className="mt-2">Built for absolutely no reason.</p>
      </footer>
    </div>
  );
}

export default App;
