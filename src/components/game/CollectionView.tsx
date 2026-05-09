'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Star, Search, Filter, Zap, Shield, ChevronLeft, ChevronRight, LayoutGrid, Info } from 'lucide-react';
import { getRarityBadgeColor } from '@/services/gameData';

const RARITIES: Rarity[] = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'];
const CARDS_PER_PAGE = 8; // 4x2 grid for single screen fit

export function CollectionView() {
  const { collection } = useGameStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'added' | 'power' | 'defense' | 'rarity'>('added');
  const [selectedCard, setSelectedCard] = useState<MonsterCard | null>(null);
  const [page, setPage] = useState(0);

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

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paginatedCards = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  if (collection.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center border-2 border-white/5 animate-pulse">
           <LayoutGrid size={40} className="text-slate-700" />
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-500">No Monsters Collected</h3>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-8 overflow-hidden p-4">
      
      {/* ── SIDEBAR CONTROLS (LEFT) ── */}
      <div className="w-[350px] shrink-0 flex flex-col bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border-2 border-white/5 overflow-hidden">
         <div className="p-8 space-y-8">
            <div>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Archives</h2>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{collection.length} TOTAL TAGS</p>
            </div>

            {/* Search */}
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={16} />
               <input
                 type="text"
                 placeholder="Find monster..."
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                 className="w-full bg-white/5 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs font-black uppercase text-white placeholder:text-slate-700 focus:outline-none focus:border-sky-500/50 transition-all"
               />
            </div>

            {/* Sorters */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Sort By</label>
               <div className="grid grid-cols-2 gap-2">
                  {(['added', 'power', 'defense', 'rarity'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`py-3 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all
                        ${sortBy === s ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                    >
                      {s}
                    </button>
                  ))}
               </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Rarity Filter</label>
               <div className="flex flex-wrap gap-2">
                  {['All', ...RARITIES].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setFilter(r as any); setPage(0); }}
                      className={`px-4 py-2 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest transition-all
                        ${filter === r ? 'bg-white border-white text-slate-950' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                    >
                      {r}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Bottom Stats */}
         <div className="mt-auto p-8 bg-black/20 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-xl font-black text-amber-400">{collection.filter(c => c.isShiny).length}</div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">SHINY UNITS</div>
               </div>
               <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="text-xl font-black text-white">{collection.filter(c => c.stars >= 5).length}</div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">LEGENDARIES</div>
               </div>
            </div>
         </div>
      </div>

      {/* ── MAIN GRID (RIGHT) ── */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
         
         <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-4">
               <div className="w-1 h-8 bg-sky-500 rounded-full" />
               <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Collection Viewer</h2>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all">
                     <ChevronLeft size={20} />
                  </button>
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">PAGE {page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20 hover:bg-white/10 transition-all">
                     <ChevronRight size={20} />
                  </button>
               </div>
            )}
         </div>

         {/* The Grid - No Overlap, Perfectly Spaced */}
         <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-8 p-4">
            <AnimatePresence mode="popLayout">
               {paginatedCards.length > 0 ? (
                  paginatedCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-center"
                    >
                       <HoloCard
                         card={card}
                         size="md"
                         onClick={() => setSelectedCard(card)}
                       />
                    </motion.div>
                  ))
               ) : (
                  <div className="col-span-4 row-span-2 flex flex-col items-center justify-center text-slate-700 gap-4 opacity-20">
                     <Search size={80} />
                     <span className="text-2xl font-black uppercase tracking-[0.5em]">No Matches</span>
                  </div>
               )}
            </AnimatePresence>
         </div>

         {/* Scroll Hint */}
         <div className="h-12 flex items-center justify-center opacity-10">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
         </div>
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
         {selectedCard && (
           <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-8"
             onClick={() => setSelectedCard(null)}
           >
              <motion.div
                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl grid grid-cols-2 gap-12 items-center"
              >
                 <div className="flex justify-center">
                    <HoloCard card={selectedCard} size="lg" showStats />
                 </div>
                 <div className="space-y-8">
                    <div>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getRarityBadgeColor(selectedCard.rarity)}`}>{selectedCard.rarity}</span>
                       <h3 className="text-6xl font-black italic uppercase tracking-tighter text-white mt-4">{selectedCard.displayName}</h3>
                       <p className="text-sky-400 font-black tracking-[0.4em] uppercase text-xs mt-2">{selectedCard.specialMove}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { label: 'HP', val: selectedCard.hp, icon: <Activity size={14} /> },
                         { label: 'ATK', val: selectedCard.attack, icon: <Zap size={14} /> },
                         { label: 'DEF', val: selectedCard.defense, icon: <Shield size={14} /> },
                         { label: 'CP', val: selectedCard.cp, icon: <Star size={14} /> },
                       ].map(s => (
                         <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                               {s.icon} <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                            </div>
                            <div className="text-2xl font-black text-white">{s.val}</div>
                         </div>
                       ))}
                    </div>

                    <button onClick={() => setSelectedCard(null)} className="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-all active:scale-95">Return to Vault</button>
                 </div>
              </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 text-center ${highlight ? 'border-amber-400/20' : ''}`}>
      <div className={`text-2xl font-black ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}

const Activity = (props: any) => <div {...props}><LayoutGrid /></div>; // Fallback
