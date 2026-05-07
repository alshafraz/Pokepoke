'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { Sparkles, Star, Zap, Activity, ShieldCheck } from 'lucide-react';
import { getRarityColor } from '@/services/gameData';

interface SummonAnimationProps {
  card: MonsterCard | null;
  onComplete: () => void;
}

export function SummonAnimation({ card, onComplete }: SummonAnimationProps) {
  const [phase, setPhase] = useState<'charging' | 'revealing' | 'showcase'>('charging');

  useEffect(() => {
    if (!card) {
      setPhase('charging');
      return;
    }
    setPhase('charging'); // Reset phase for new card
    const t1 = setTimeout(() => setPhase('revealing'), 2000);
    const t2 = setTimeout(() => setPhase('showcase'), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [card]);

  if (!card) return null;

  const isRare = card.rarity === 'Legendary' || card.rarity === 'Mythic' || card.rarity === 'Ultra Rare';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 overflow-hidden pointer-events-auto">
      {/* ── BACKGROUND FX ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${isRare ? 'from-amber-900 via-slate-950 to-slate-950' : 'from-sky-900 via-slate-950 to-slate-950'}`} />
        
        {/* Animated Rings */}
        <AnimatePresence>
          {phase === 'charging' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2, 4], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-4 border-sky-500/50 rounded-full"
            />
          )}
        </AnimatePresence>

        {/* Cinematic Shake on Reveal */}
        {phase === 'revealing' && isRare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0], x: [-10, 10, -10, 10, 0] }}
            transition={{ duration: 0.1, repeat: 15 }}
            className="fixed inset-0 bg-white z-[110]"
          />
        )}
      </div>

      {/* ── CENTRAL ANIMATION ── */}
      <div className="relative z-[9999] flex flex-col items-center pointer-events-auto">
        
        <AnimatePresence mode="wait">
          {phase === 'charging' && (
            <motion.div
              key="charging"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 2, filter: 'blur(20px)' }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-40 h-40 rounded-full border-b-4 border-sky-400"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={48} className="text-sky-400 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl font-black italic text-sky-400 tracking-[0.5em] uppercase">Initializing Neural Link...</h2>
            </motion.div>
          )}

          {phase === 'revealing' && (
            <motion.div
              key="revealing"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: 1 }}
              exit={{ opacity: 0, scale: 3, filter: 'blur(50px)' }}
              className="relative"
            >
              <div className="absolute inset-0 blur-[100px] bg-white animate-pulse" />
              <div className="text-8xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]">
                REVEALING
              </div>
            </motion.div>
          )}

          {phase === 'showcase' && (
            <motion.div
              key="showcase"
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Explosion Effect */}
              {isRare && <div className="absolute w-[800px] h-[800px] bg-amber-400/20 rounded-full blur-[150px] animate-pulse" />}

              <div className="relative">
                <HoloCard card={card} size="lg" />
                
                {/* Rarity Label Floating */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-20 top-20 rotate-90 origin-left pointer-events-none"
                >
                  <div className={`text-6xl font-black uppercase tracking-tighter italic opacity-20 ${isRare ? 'text-amber-400' : 'text-sky-400'}`}>
                    {card.rarity}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col items-center z-[100]"
              >
                <div className="text-sky-400 text-xs font-black uppercase tracking-[0.4em] mb-2">Collectible Tag Synchronized</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="px-12 py-4 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl relative z-[100] cursor-pointer pointer-events-auto"
                >
                  Add to Collection
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PARTICLE BURST (Legendary) ── */}
      {phase === 'showcase' && isRare && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50%', y: '50%', scale: 0 }}
              animate={{ 
                x: `${Math.random() * 100}%`, 
                y: `${Math.random() * 100}%`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, delay: 0.5 + Math.random() }}
              className="absolute w-2 h-2 bg-amber-400 rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
