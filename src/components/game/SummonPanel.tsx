'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { fetchRandomMonster } from '@/services/gameData';
import { SummonAnimation } from './SummonAnimation';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Sparkles, Coins, Info } from 'lucide-react';

const SUMMON_PACKS = [
  { 
    id: 'basic',  
    name: 'BASIC',    
    cost: 50,   
    icon: '/images/game/poke-ball-hd.png', 
    color: 'from-slate-600/20 to-slate-900/60',
    accent: 'bg-slate-400',
    guaranteed: undefined,
    rates: { common: '50%', rare: '25%', sr: '12%', ur: '8%', leg: '4%', myth: '1%' }
  },
  { 
    id: 'rare',   
    name: 'GREAT',     
    cost: 150,  
    icon: '/images/game/great-ball-hd.png', 
    color: 'from-blue-600/20 to-indigo-950/60',   
    accent: 'bg-blue-400',
    guaranteed: 'Rare' as Rarity,
    rates: { common: '20%', rare: '40%', sr: '20%', ur: '12%', leg: '6%', myth: '2%' }
  },
  { 
    id: 'ultra',  
    name: 'ULTRA',    
    cost: 350,  
    icon: '/images/game/ultra-ball-hd.png', 
    color: 'from-amber-600/20 to-orange-950/60',   
    accent: 'bg-amber-400',
    guaranteed: 'Ultra Rare' as Rarity,
    rates: { common: '0%', rare: '30%', sr: '35%', ur: '20%', leg: '10%', myth: '5%' }
  },
  { 
    id: 'legend', 
    name: 'MASTER',   
    cost: 800,  
    icon: '/images/game/master-ball-hd.png', 
    color: 'from-purple-600/20 to-indigo-950/60', 
    accent: 'bg-purple-400',
    guaranteed: 'Legendary' as Rarity,
    rates: { common: '0%', rare: '0%', sr: '0%', ur: '0%', leg: '80%', myth: '20%' }
  },
  { 
    id: 'mythic', 
    name: 'LUXURY',     
    cost: 2000, 
    icon: '/images/game/luxury-ball-hd.png', 
    color: 'from-rose-600/20 to-rose-950/60', 
    accent: 'bg-rose-400',
    guaranteed: 'Mythic' as Rarity,
    rates: { common: '0%', rare: '0%', sr: '0%', ur: '0%', leg: '0%', myth: '100%' }
  },
];

export function SummonPanel() {
  const { coins, spendCoins, summonCard } = useGameStore();
  const [summoning, setSummoning] = useState(false);
  const [pendingCard, setPendingCard] = useState<MonsterCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPack, setHoveredPack] = useState<typeof SUMMON_PACKS[0] | null>(null);

  const activeRates = (hoveredPack || SUMMON_PACKS[0]).rates;

  const handleSummon = async (pack: typeof SUMMON_PACKS[0]) => {
    if (!spendCoins(pack.cost)) {
      setError("Not enough coins! 💰");
      setTimeout(() => setError(null), 2000);
      return;
    }
    setSummoning(true);
    try {
      const card = await fetchRandomMonster(pack.guaranteed);
      setPendingCard(card);
    } catch {
      setSummoning(false);
      setError("Summon failed. Try again.");
    }
  };

  const handleComplete = () => {
    if (pendingCard) summonCard(pendingCard);
    setPendingCard(null);
    setSummoning(false);
  };

  return (
    <div className="h-full flex flex-col gap-4 max-w-7xl mx-auto overflow-hidden relative">
      
      {/* Error Message Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] py-4 px-10 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5-COLUMN GRID (LOCAL STABLE ASSETS) ── */}
      <div className="flex-1 grid grid-cols-5 gap-4 min-h-0 py-2">
        {SUMMON_PACKS.map((pack, i) => {
          const canAfford = coins >= pack.cost;
          return (
            <motion.button
              key={pack.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={canAfford ? { scale: 1.02, y: -10 } : {}}
              whileTap={canAfford ? { scale: 0.98 } : {}}
              onMouseEnter={() => setHoveredPack(pack)}
              onMouseLeave={() => setHoveredPack(null)}
              onClick={() => !summoning && handleSummon(pack)}
              disabled={!canAfford || summoning}
              className={`group relative rounded-[2.5rem] border-2 border-white/5 bg-gradient-to-b ${pack.color} p-6 overflow-hidden flex flex-col items-center justify-between transition-all
                ${!canAfford ? 'opacity-20 grayscale cursor-not-allowed' : 'shadow-2xl hover:border-white/20'}`}
            >
              {/* Ball Illustration */}
              <div className="flex-1 flex items-center justify-center relative w-full mb-4">
                 <div className={`absolute inset-0 ${pack.accent} blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity`} />
                 <motion.img 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   src={pack.icon} 
                   alt={pack.name} 
                   className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110" 
                 />
              </div>

              {/* Info Area */}
              <div className="relative z-20 w-full flex flex-col items-center">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">{pack.id}</div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-6">{pack.name}</h3>
                
                {/* Clean Price Tag */}
                <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 border-2 transition-all ${canAfford ? 'bg-white text-slate-900 border-white font-black shadow-xl' : 'bg-black/40 border-white/5 text-white/30'}`}>
                   <Coins size={18} className={canAfford ? "text-amber-500" : "text-slate-700"} />
                   <span className="text-xl leading-none">{pack.cost.toLocaleString()}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── INTERACTIVE PROBABILITY PANEL ── */}
      <div className="bg-slate-900/60 border-t-2 border-white/5 p-6 backdrop-blur-3xl shrink-0 rounded-t-[2.5rem]">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
               <h3 className="text-lg font-black uppercase tracking-[0.4em] text-white italic">
                  Probabilities: <span className="text-sky-400">{(hoveredPack || SUMMON_PACKS[0]).name}</span>
               </h3>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
               Hover cards to compare rates
            </div>
         </div>
         
         <div className="grid grid-cols-6 gap-4">
            {[
              { id: 'common', name: 'Common',      color: 'bg-slate-500' },
              { id: 'rare',   name: 'Rare',        color: 'bg-blue-500' },
              { id: 'sr',     name: 'Super Rare',  color: 'bg-violet-500' },
              { id: 'ur',     name: 'Ultra Rare',  color: 'bg-rose-500' },
              { id: 'leg',    name: 'Legendary',   color: 'bg-amber-500' },
              { id: 'myth',   name: 'Mythic',      color: 'bg-fuchsia-500' },
            ].map((r) => {
              const val = activeRates[r.id as keyof typeof activeRates];
              return (
                <div key={r.name} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{r.name}</span>
                      <motion.span 
                        key={val}
                        initial={{ scale: 1.2, color: '#38bdf8' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-sm font-black text-white"
                      >
                        {val}
                      </motion.span>
                   </div>
                   <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: val }}
                        className={`h-full ${r.color}`} 
                      />
                   </div>
                </div>
              );
            })}
         </div>
      </div>

      {/* Summon Animation Overlay */}
      <SummonAnimation card={pendingCard} onComplete={handleComplete} />
    </div>
  );
}
