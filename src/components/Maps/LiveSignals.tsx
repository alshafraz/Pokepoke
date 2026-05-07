'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Target, User } from 'lucide-react';

interface Signal {
  id: number;
  x: number;
  y: number;
  type: 'hunter' | 'rare';
  label: string;
}

export function LiveSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const isRare = Math.random() > 0.7;
      const newSignal: Signal = {
        id: Date.now(),
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        type: isRare ? 'rare' : 'hunter',
        label: isRare ? 'RARE SPAWN' : 'AGENT DETECTED'
      };

      setSignals(prev => [...prev.slice(-10), newSignal]);

      setTimeout(() => {
        setSignals(prev => prev.filter(s => s.id !== newSignal.id));
      }, 5000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <AnimatePresence>
        {signals.map((s) => (
          <motion.div
            key={s.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full ${s.type === 'rare' ? 'bg-amber-500/20' : 'bg-sky-500/20'} animate-ping absolute inset-0`} />
              <div className={`p-1.5 rounded-full border ${s.type === 'rare' ? 'bg-amber-500 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-sky-500 border-sky-300'} text-white`}>
                {s.type === 'rare' ? <Target size={10} /> : <User size={10} />}
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 px-1.5 py-0.5 bg-slate-950/80 border border-white/10 rounded text-[6px] font-black uppercase tracking-widest text-white whitespace-nowrap"
              >
                {s.label}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
