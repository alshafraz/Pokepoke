'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { fetchRandomMonster, getEffectiveness } from '@/services/gameData';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Swords, Shield, Filter, Search, Trophy, RotateCcw, TrendingUp, TrendingDown, Info, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ArcadeMode() {
  const { collection, startBattle, setMode, selectedCard, selectCard, arcadeSession, startArcadeSession } = useGameStore();
  const [enemy, setEnemy] = useState<MonsterCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'added' | 'power' | 'defense' | 'rarity'>('power');
  const [rarityFilter, setRarityFilter] = useState<string>('All');

  const rarityWeight: Record<string, number> = {
    'Common': 1, 'Rare': 2, 'Super Rare': 3, 'Ultra Rare': 4, 'Legendary': 5, 'Mythic': 6
  };

  const filteredCollection = collection
    .filter((c) => rarityFilter === 'All' || c.rarity === rarityFilter)
    .sort((a, b) => {
      if (sortBy === 'power') return b.cp - a.cp;
      if (sortBy === 'defense') return b.defense - a.defense;
      if (sortBy === 'rarity') return (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0);
      if (sortBy === 'added') return (b.capturedAt || 0) - (a.capturedAt || 0);
      return 0;
    });

  const fetchEnemy = async () => {
    setLoading(true);
    try {
      const highRarities: Rarity[] = ['Ultra Rare', 'Legendary', 'Mythic'];
      const randomHighRarity = highRarities[Math.floor(Math.random() * highRarities.length)];
      const card = await fetchRandomMonster(randomHighRarity);
      setEnemy(card);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEnemy();
    if (arcadeSession.rounds === 0 && arcadeSession.results.length === 0) {
      startArcadeSession();
    }
    selectCard(null);
  }, []);

  // Detailed Matchup Analysis
  const matchup = useMemo(() => {
    if (!selectedCard || !enemy) return null;
    const playerEff = getEffectiveness(selectedCard.types, enemy.types);
    const enemyEff = getEffectiveness(enemy.types, selectedCard.types);
    
    if (playerEff > 1) return { 
       status: 'ADVANTAGE', 
       color: 'emerald', 
       icon: <TrendingUp size={16} />,
       msg: 'Strong against enemy types!',
       glow: 'shadow-emerald-500/40'
    };
    if (enemyEff > 1) return { 
       status: 'WEAKNESS', 
       color: 'rose', 
       icon: <TrendingDown size={16} />,
       msg: 'Vulnerable to enemy attacks!',
       glow: 'shadow-rose-500/40'
    };
    return { 
       status: 'NEUTRAL', 
       color: 'slate', 
       icon: <Info size={16} />,
       msg: 'Balanced matchup.',
       glow: 'shadow-slate-500/20'
    };
  }, [selectedCard, enemy]);

  const handleBattle = () => {
    if (!selectedCard || !enemy) return;
    if (arcadeSession.collectionHp[selectedCard.id] === 0) return;
    startBattle(selectedCard, enemy);
    setMode('battle');
  };

  return (
    <div className="h-full flex gap-4 overflow-hidden relative">
      
      {/* ── REFINED SIDEBAR ── */}
      <div className="w-[300px] shrink-0 flex flex-col bg-slate-950/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
         <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-5 bg-sky-500 rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Fighters</h3>
               </div>
               <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-black text-slate-500 uppercase">{filteredCollection.length}</span>
            </div>
            
            <div className="flex gap-2">
               <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="flex-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/60 px-3 py-2 rounded-xl outline-none focus:bg-white/10 transition-all">
                  <option value="power" className="bg-slate-900">Sort: CP</option>
                  <option value="rarity" className="bg-slate-900">Sort: Rarity</option>
               </select>
               <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)} className="flex-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/60 px-3 py-2 rounded-xl outline-none focus:bg-white/10 transition-all">
                  <option value="All" className="bg-slate-900">Type: All</option>
                  {['Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'].map(r => (
                    <option key={r} value={r} className="bg-slate-900">{r}</option>
                  ))}
               </select>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
            {filteredCollection.map((card) => {
               const isSelected = selectedCard?.id === card.id;
               const hp = arcadeSession.collectionHp[card.id] ?? card.hp;
               const isFainted = hp === 0;

               // Subtle indicator in Sidebar (integrated into design)
               let cardEffect = null;
               if (enemy && !isFainted) {
                  const pEff = getEffectiveness(card.types, enemy.types);
                  const eEff = getEffectiveness(enemy.types, card.types);
                  if (pEff > 1) cardEffect = 'bg-emerald-500';
                  else if (eEff > 1) cardEffect = 'bg-rose-500';
               }

               return (
                 <button
                   key={card.id}
                   onClick={() => !isFainted && selectCard(card)}
                   className={`w-full group relative flex items-center gap-3 p-2.5 rounded-2xl border transition-all duration-300
                     ${isSelected 
                        ? 'bg-sky-500/10 border-sky-500/40 shadow-lg' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                 >
                    {/* Tactical Indicator Strip */}
                    {cardEffect && (
                       <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${cardEffect}`} />
                    )}

                    <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden relative shrink-0 border border-white/5 group-hover:border-white/20 transition-all">
                       <img src={card.artworkUrl} className={`w-full h-full object-contain ${isFainted ? 'grayscale opacity-30' : ''}`} alt={card.name} />
                       {isFainted && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Zap size={14} className="text-slate-600" /></div>}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-[10px] font-black uppercase tracking-tight truncate ${isFainted ? 'text-slate-600' : 'text-white'}`}>{card.displayName}</span>
                           <span className={`text-[9px] font-black ${isFainted ? 'text-slate-700' : 'text-sky-400'}`}>{card.cp}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(hp / card.hp) * 100}%` }} className={`h-full ${isFainted ? 'bg-slate-800' : hp < card.hp * 0.3 ? 'bg-rose-500' : 'bg-sky-500'}`} />
                        </div>
                    </div>
                 </button>
               );
            })}
         </div>
      </div>

      {/* ── MAIN ARENA ── */}
      <div className="flex-1 flex flex-col relative overflow-visible">
         
         {/* Top Header - Premium Matchup Analysis Bar */}
         <div className="h-16 flex items-center justify-between px-8 bg-slate-950/40 border-b border-white/5 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-4">
               <div className="flex flex-col">
                  <h2 className="text-lg font-black uppercase tracking-tighter text-white">Battle Arena</h2>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Match Preparation Phase</p>
               </div>
            </div>
            
            <AnimatePresence mode="wait">
              {matchup ? (
                <motion.div 
                  key={matchup.status}
                  initial={{ y: -10, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: 10, opacity: 0 }}
                  className={`flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 shadow-2xl ${matchup.color === 'emerald' ? 'bg-emerald-500/10' : matchup.color === 'rose' ? 'bg-rose-500/10' : 'bg-white/5'}`}
                >
                   <div className={`p-1 rounded-full ${matchup.color === 'emerald' ? 'bg-emerald-500' : matchup.color === 'rose' ? 'bg-rose-500' : 'bg-slate-500'}`}>
                      {matchup.color === 'emerald' ? <CheckCircle2 size={12} className="text-white" /> : matchup.color === 'rose' ? <AlertTriangle size={12} className="text-white" /> : <Info size={12} className="text-white" />}
                   </div>
                   <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${matchup.color === 'emerald' ? 'text-emerald-400' : matchup.color === 'rose' ? 'text-rose-400' : 'text-slate-400'}`}>
                         {matchup.status} MATCHUP
                      </span>
                      <span className="text-[8px] font-medium text-slate-500 uppercase">{matchup.msg}</span>
                   </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 italic">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Awaiting Fighter Selection...</span>
                </div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl border border-white/5">
               <span className="text-[10px] font-black text-white italic">ROUND {arcadeSession.rounds + 1} / {arcadeSession.maxRounds}</span>
            </div>
         </div>

         {/* Battle Stage */}
         <div className="flex-1 flex items-center justify-around px-8 relative overflow-visible">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
               <div className="text-[15rem] font-black italic text-white/[0.02] tracking-tighter select-none">VS</div>
            </div>

            {/* Your Fighter */}
            <div className="relative z-10 shrink-0">
               <div className="mb-6 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-black text-sky-400 uppercase tracking-[0.3em]">YOUR FIGHTER</span>
                  {matchup?.status === 'ADVANTAGE' && (
                    <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">Tactical Boost Active</motion.span>
                  )}
               </div>

               {selectedCard ? (
                  <div className="relative group">
                     {/* Clean Advantage Glow */}
                     <AnimatePresence>
                        {matchup?.status === 'ADVANTAGE' && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                             className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full z-0" />
                        )}
                        {matchup?.status === 'WEAKNESS' && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                             className="absolute -inset-10 bg-rose-500/10 blur-[80px] rounded-full z-0" />
                        )}
                     </AnimatePresence>
                     
                     <div className={`relative z-10 ${arcadeSession.collectionHp[selectedCard.id] === 0 ? 'grayscale opacity-50' : ''}`}>
                        <HoloCard card={selectedCard} size="lg" showStats />
                     </div>

                     {/* Integrated Status Badge (Inside Card Area) */}
                     <AnimatePresence>
                        {matchup && matchup.status !== 'NEUTRAL' && (
                           <motion.div 
                             initial={{ y: 20, opacity: 0 }} 
                             animate={{ y: 0, opacity: 1 }}
                             className={`absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 px-6 py-2 rounded-full border-2 border-white/90 shadow-2xl backdrop-blur-xl ${matchup.color === 'emerald' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                           >
                              <div className="flex items-center gap-2">
                                 {matchup.icon}
                                 <span className="text-xs font-black uppercase tracking-tighter italic">{matchup.status}</span>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

                     {arcadeSession.collectionHp[selectedCard.id] === 0 && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center">
                           <div className="bg-slate-950/90 backdrop-blur-md px-8 py-4 rounded-3xl border-2 border-white/20 shadow-2xl">
                              <span className="text-lg font-black text-rose-500 uppercase tracking-widest italic">OUT OF ACTION</span>
                           </div>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="w-[20rem] h-[30rem] rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center gap-4 group hover:border-white/20 transition-all">
                     <Swords size={40} className="text-white/5 group-hover:text-white/10 transition-colors" />
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Empty Slot</p>
                  </div>
               )}
            </div>

            {/* Fight Controller */}
            <div className="flex flex-col items-center gap-10 z-20 mx-6 shrink-0">
               <motion.button
                 whileHover={selectedCard && enemy && (arcadeSession.collectionHp[selectedCard.id] !== 0) ? { scale: 1.1 } : {}}
                 whileTap={selectedCard && enemy && (arcadeSession.collectionHp[selectedCard.id] !== 0) ? { scale: 0.95 } : {}}
                 onClick={handleBattle}
                 disabled={!selectedCard || !enemy || loading || (arcadeSession.collectionHp[selectedCard?.id || ''] === 0)}
                 className={`w-24 h-24 rounded-full border-4 transition-all flex flex-col items-center justify-center gap-1 shadow-2xl relative
                   ${selectedCard && enemy && (arcadeSession.collectionHp[selectedCard.id] !== 0)
                     ? 'bg-gradient-to-br from-rose-500 to-indigo-600 border-white text-white shadow-rose-500/40'
                     : 'bg-slate-900 border-white/5 text-slate-800 opacity-50 cursor-not-allowed'}`}
               >
                  <Swords size={28} />
                  <span className="text-[9px] font-black uppercase tracking-widest">START</span>
                  
                  {matchup?.status === 'ADVANTAGE' && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
                       <TrendingUp size={16} className="text-white" />
                    </div>
                  )}
               </motion.button>
            </div>

            {/* Enemy Unit */}
            <div className="relative z-10 shrink-0">
               <div className="mb-6 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">ENEMY UNIT</span>
                     <button onClick={fetchEnemy} disabled={loading} className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 transition-all">
                       <RotateCcw size={10} className={`text-white/40 ${loading ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
               </div>
               {loading ? (
                  <div className="w-[20rem] h-[30rem] rounded-[3rem] bg-black/20 border border-white/5 flex items-center justify-center backdrop-blur-sm">
                     <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  </div>
               ) : enemy ? (
                  <div className="relative">
                     <HoloCard card={enemy} size="lg" showStats />
                  </div>
               ) : null}
            </div>

         </div>

         <div className="h-10 flex items-center justify-center opacity-5 pointer-events-none">
            <Zap size={32} className="text-white" />
         </div>
      </div>

    </div>
  );
}
