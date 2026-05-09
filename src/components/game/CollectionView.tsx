'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Star, Search, Filter, Zap, Shield, ChevronLeft, ChevronRight, LayoutGrid, Box, MoveHorizontal, Swords } from 'lucide-react';
import { getRarityBadgeColor } from '@/services/gameData';

const RARITIES: Rarity[] = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'];

export function CollectionView() {
  const { collection } = useGameStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'added' | 'power' | 'defense' | 'rarity'>('added');
  const [selectedCard, setSelectedCard] = useState<MonsterCard | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  const rarityWeight: Record<Rarity, number> = {
    'Common': 1, 'Rare': 2, 'Super Rare': 3, 'Ultra Rare': 4, 'Legendary': 5, 'Mythic': 6
  };

  const filtered = useMemo(() => {
    return collection
      .filter((c) => {
        const matchName = c.displayName.toLowerCase().includes(search.toLowerCase());
        const matchRarity = filter === 'All' || c.rarity === filter;
        return matchName && matchRarity;
      })
      .sort((a, b) => {
        if (sortBy === 'added') return (b.capturedAt || 0) - (a.capturedAt || 0);
        if (sortBy === 'power') return b.cp - a.cp;
        if (sortBy === 'defense') return b.defense - a.defense;
        if (sortBy === 'rarity') return rarityWeight[b.rarity] - rarityWeight[a.rarity];
        return 0;
      });
  }, [collection, search, filter, sortBy]);

  useEffect(() => {
    if (scrollRef.current && containerRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setConstraints({ left: -(scrollWidth - containerWidth + 100), right: 100 });
    }
  }, [filtered]);

  if (collection.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center border-2 border-white/5 animate-pulse">
           <LayoutGrid size={32} className="text-slate-700" />
        </div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-500">No Monsters Collected</h3>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative p-4 lg:p-8 select-none">
      
      {/* ── TOP NAV ── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
         <div className="flex items-center gap-4">
            <div className="bg-sky-500/20 p-3 rounded-2xl border border-sky-500/30">
               <Box className="text-sky-400" size={24} />
            </div>
            <div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">The Archives</h2>
               <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{collection.length} TOTAL TAGS</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="relative group w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={14} />
               <input
                 type="text"
                 placeholder="Search database..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[10px] font-black uppercase text-white placeholder:text-slate-700 focus:outline-none focus:border-sky-500/30 transition-all"
               />
            </div>
            <div className="flex bg-slate-900/60 p-1 rounded-xl border border-white/5">
               {(['power', 'rarity', 'added'] as const).map(s => (
                 <button key={s} onClick={() => setSortBy(s)}
                   className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all
                     ${sortBy === s ? 'bg-white text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* ── CENTRAL CONTENT: THE VAULT REEL ── */}
      <div className="flex-1 flex flex-col justify-center relative min-h-0" ref={containerRef}>
         <div className="flex-1 overflow-visible cursor-grab active:cursor-grabbing flex items-center">
            <motion.div 
              ref={scrollRef}
              drag="x"
              dragConstraints={constraints}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 200, bounceDamping: 25 }}
              className="flex -space-x-28 px-24 py-40 h-full items-center min-w-max overflow-visible"
            >
               <AnimatePresence mode="popLayout">
                  {filtered.map((card, i) => {
                    const isFocused = hoveredId === card.id;
                    const isBlur = hoveredId !== null && !isFocused;

                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: isBlur ? 0.3 : 1, 
                          scale: isFocused ? 1.2 : 1,
                          filter: isBlur ? 'blur(12px)' : 'blur(0px)',
                          zIndex: isFocused ? 100 : i,
                          y: isFocused ? -30 : 0,
                        }}
                        transition={{ 
                          type: 'spring', 
                          stiffness: 300, 
                          damping: 30,
                        }}
                        onMouseEnter={() => setHoveredId(card.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="shrink-0 relative overflow-visible"
                      >
                         <div className="relative group" onClick={() => setSelectedCard(card)}>
                            {isFocused && (
                               <motion.div 
                                 layoutId="focus-aura"
                                 className={`absolute inset-0 blur-[140px] rounded-full opacity-60 bg-gradient-to-br ${getRarityBadgeColor(card.rarity)}`}
                               />
                            )}
                            <HoloCard card={card} size="md" />
                         </div>
                      </motion.div>
                    );
                  })}
               </AnimatePresence>
            </motion.div>
         </div>

         {/* Rarity Filter Strip */}
         <div className="flex justify-center gap-2 mt-4 shrink-0">
            {['All', ...RARITIES].map((r) => (
              <button key={r} onClick={() => setFilter(r as any)}
                className={`px-6 py-2 rounded-full border-2 text-[8px] font-black uppercase tracking-widest transition-all
                  ${filter === r ? 'bg-white border-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                {r}
              </button>
            ))}
         </div>
      </div>

      {/* ── CINEMATIC OVERLAY: POKEMON FOCUS ── */}
      <AnimatePresence>
         {selectedCard && (
           <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-8"
             onClick={() => setSelectedCard(null)}
           >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center"
              >
                 {/* LEFT SIDE: POKEMON ARTWORK (Corrected Prop: artworkUrl) */}
                 <div className="relative group flex items-center justify-center">
                    <div className={`absolute w-[120%] h-[120%] blur-[180px] opacity-30 rounded-full animate-pulse bg-gradient-to-br ${getRarityBadgeColor(selectedCard.rarity)}`} />
                    
                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10"
                    >
                       {/* Fixed: Used artworkUrl instead of imageUrl */}
                       <img 
                         src={selectedCard.artworkUrl} 
                         alt={selectedCard.displayName} 
                         className="w-[450px] h-[450px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                       />
                       
                       {selectedCard.isShiny && (
                         <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)].map((_, i) => (
                               <motion.div
                                 key={i}
                                 animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                 transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                 className="absolute w-3 h-3 bg-white blur-sm rounded-full"
                                 style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                               />
                            ))}
                         </div>
                       )}
                    </motion.div>
                    <div className="absolute bottom-4 w-[50%] h-8 bg-black/40 blur-2xl rounded-full" />
                 </div>
                 
                 {/* RIGHT SIDE: STATS & DATA */}
                 <div className="space-y-10 min-w-0">
                    <div className="space-y-4 min-w-0">
                       <div className="flex items-center gap-4">
                          <span className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] ${getRarityBadgeColor(selectedCard.rarity)}`}>{selectedCard.rarity}</span>
                       </div>
                       
                       {/* Fixed: Responsive name size with truncation safety */}
                       <h3 className="text-6xl md:text-7xl lg:text-[7rem] font-black italic uppercase tracking-tighter text-white leading-none break-words line-clamp-2">
                          {selectedCard.displayName}
                       </h3>
                       
                       <div className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-500/40">
                             <Swords className="text-sky-400" size={24} />
                          </div>
                          <div className="min-w-0">
                             <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Signature Move</div>
                             <div className="text-xl font-black text-white uppercase tracking-wider truncate">{selectedCard.specialMove}</div>
                             <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed opacity-60 uppercase italic">
                                Executes a high-velocity strike that pierces enemy defenses and maximizes combat potential.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'Health', val: selectedCard.hp, icon: <LayoutGrid size={16} /> },
                         { label: 'Attack', val: selectedCard.attack, icon: <Zap size={16} /> },
                         { label: 'Defense', val: selectedCard.defense, icon: <Shield size={16} /> },
                         { label: 'Combat Power', val: selectedCard.cp, icon: <Star size={16} /> },
                       ].map(s => (
                         <div key={s.label} className="bg-white/5 border border-white/5 rounded-3xl p-5">
                            <div className="flex items-center gap-3 text-slate-500 mb-1.5">
                               {s.icon} <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                            </div>
                            <div className="text-3xl font-black text-white">{s.val.toLocaleString()}</div>
                         </div>
                       ))}
                    </div>

                    <button onClick={() => setSelectedCard(null)} className="group flex items-center justify-between w-full p-6 bg-white rounded-[2rem] hover:bg-sky-500 transition-all active:scale-95 shadow-2xl">
                       <span className="text-slate-950 font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors ml-2 text-xs">Close Entry</span>
                       <ChevronRight className="text-slate-950 group-hover:text-white group-hover:translate-x-2 transition-all mr-2" size={24} />
                    </button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}
