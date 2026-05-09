'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { fetchRandomMonster } from '@/services/gameData';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Swords, RefreshCw, Shield, Filter, Search, Trophy, RotateCcw } from 'lucide-react';

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
      // Logic: Pick high rarity for enemy (Stars >= 4)
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
    if (!selectedCard && collection.length > 0) {
      selectCard(collection[0]);
    }
  }, []);

  const handleBattle = () => {
    if (!selectedCard || !enemy) return;
    startBattle(selectedCard, enemy);
    setMode('battle');
  };

  return (
    <div className="h-full flex gap-8 overflow-hidden relative p-4">
      
      {/* ── LEFT SIDEBAR: COLLECTION (380px) ── */}
      <div className="w-[380px] shrink-0 flex flex-col bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border-2 border-white/5 overflow-hidden">
         <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg"><Filter size={20} className="text-white" /></div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Fighters</h3>
               </div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">{filteredCollection.length} CARDS</span>
            </div>
            
            <div className="flex gap-2">
               <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="flex-1 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/40 px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition-colors">
                  <option value="power">Sort: CP</option>
                  <option value="rarity">Sort: Rarity</option>
               </select>
               <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)} className="flex-1 bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/40 px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition-colors">
                  <option value="All">All Type</option>
                  {['Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'].map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
            {filteredCollection.map((card) => {
               const isSelected = selectedCard?.id === card.id;
               const hp = arcadeSession.collectionHp[card.id] ?? card.hp;
               const isFainted = hp === 0;

               return (
                 <motion.button
                   key={card.id}
                   whileHover={!isFainted ? { x: 10 } : {}}
                   whileTap={!isFainted ? { scale: 0.98 } : {}}
                   onClick={() => !isFainted && selectCard(card)}
                   className={`w-full group relative flex items-center gap-4 p-4 rounded-3xl border-2 transition-all overflow-hidden
                     ${isSelected 
                        ? 'bg-sky-500/20 border-sky-500/50 shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
                 >
                    <div className="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden relative shrink-0 border border-white/10">
                       <img src={card.artworkUrl} className={`w-full h-full object-contain ${isFainted ? 'grayscale' : ''}`} alt={card.name} />
                       {isFainted && <div className="absolute inset-0 bg-rose-500/40 flex items-center justify-center"><Shield size={16} className="text-white" /></div>}
                    </div>

                    <div className="flex-1 text-left">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-black text-white italic uppercase truncate w-32">{card.displayName}</span>
                          <span className="text-[10px] font-black text-sky-400">CP {card.cp.toLocaleString()}</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(hp / card.hp) * 100}%` }} className={`h-full ${hp < card.hp * 0.3 ? 'bg-rose-500' : 'bg-sky-500'}`} />
                       </div>
                    </div>

                    {isSelected && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                       </div>
                    )}
                 </motion.button>
               );
            })}
         </div>
      </div>

      {/* ── RIGHT PANEL: MAIN ARENA (70%) ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
         
         <div className="flex items-center justify-between px-10 pt-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="w-1 h-8 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,1)]" />
               <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Battle Arena</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match preparation phase</p>
               </div>
            </div>
            <div className="px-8 py-3 bg-white/5 border-2 border-white/5 rounded-2xl text-xs font-black text-white uppercase tracking-[0.4em] italic backdrop-blur-xl">
               ROUND {arcadeSession.rounds + 1} / {arcadeSession.maxRounds}
            </div>
         </div>

         <div className="flex-1 flex items-center justify-between px-20 relative">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
               <div className="text-[25rem] font-black italic text-white/[0.02] tracking-tighter select-none">VS</div>
            </div>

            {/* Selected Fighter */}
            <motion.div 
               key={selectedCard?.id}
               initial={{ x: -100, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }}
               className="relative z-10"
            >
               <div className="mb-4 text-center">
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.4em]">YOUR FIGHTER</span>
               </div>
               {selectedCard && (
                  <div className="relative group">
                     <HoloCard card={selectedCard} size="lg" showStats />
                     <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-sky-500/20 blur-2xl rounded-full" />
                  </div>
               )}
            </motion.div>

            {/* Action Center */}
            <div className="flex flex-col items-center gap-10 z-20">
               <motion.button
                 whileHover={selectedCard && enemy ? { scale: 1.1, rotate: 5 } : {}}
                 whileTap={selectedCard && enemy ? { scale: 0.9 } : {}}
                 onClick={handleBattle}
                 disabled={!selectedCard || !enemy || loading || (arcadeSession.collectionHp[selectedCard?.id || ''] === 0)}
                 className={`w-40 h-40 rounded-full border-[10px] transition-all flex flex-col items-center justify-center gap-2 shadow-2xl relative
                   ${selectedCard && enemy && (arcadeSession.collectionHp[selectedCard.id] !== 0)
                     ? 'bg-gradient-to-br from-rose-500 to-indigo-600 border-white text-white shadow-rose-500/60'
                     : 'bg-slate-900 border-white/5 text-slate-700 opacity-50 cursor-not-allowed'}`}
               >
                  <Swords size={56} />
                  <span className="text-sm font-black uppercase tracking-[0.3em] italic">Fight!</span>
                  
                  {selectedCard && enemy && (arcadeSession.collectionHp[selectedCard.id] !== 0) && (
                    <motion.div 
                       animate={{ scale: [1, 1.4], opacity: [0.3, 0] }} 
                       transition={{ duration: 1.5, repeat: Infinity }} 
                       className="absolute inset-0 rounded-full border-4 border-white/30" 
                    />
                  )}
               </motion.button>
            </div>

            {/* Enemy Fighter */}
            <motion.div 
               key={enemy?.id}
               initial={{ x: 100, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }}
               className="relative z-10"
            >
               <div className="mb-4 flex items-center justify-center gap-4">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em]">ENEMY UNIT</span>
                  {/* Slimmed down Change Enemy Button */}
                  <button 
                    onClick={fetchEnemy} 
                    disabled={loading}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 transition-all group/btn shadow-lg"
                    title="Change Enemy"
                  >
                    <RotateCcw size={14} className={`text-white/40 group-hover/btn:text-rose-400 ${loading ? 'animate-spin' : ''}`} />
                  </button>
               </div>
               {loading ? (
                  <div className="w-80 h-[30rem] rounded-[2.5rem] bg-black/40 border-4 border-white/5 flex items-center justify-center">
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full" />
                  </div>
               ) : enemy ? (
                  <div className="relative group">
                     <HoloCard card={enemy} size="lg" showStats />
                     <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-rose-500/20 blur-2xl rounded-full" />
                  </div>
               ) : null}
            </motion.div>

         </div>

         <div className="h-20 flex items-center justify-center opacity-10">
            <Trophy size={60} className="text-white" />
         </div>
      </div>

    </div>
  );
}
