import React from 'react';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full p-6 absolute top-0 left-0 z-50 flex justify-between items-center bg-slate-900/50 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-sadhya-green rounded-lg text-white">
          <Leaf size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Dumb<span className="text-sadhya-gold font-light">Buy</span></span>
      </div>
      <div className="hidden md:flex gap-6 text-sm text-slate-400 font-medium">
        <span className="hover:text-white cursor-pointer transition-colors">Philosophy</span>
        <span className="hover:text-white cursor-pointer transition-colors">Useless Cases</span>
        <span className="hover:text-white cursor-pointer transition-colors">Don't Contact Us</span>
      </div>
    </nav>
  );
}
