'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Grid, List, Star, Search, Filter, Sparkles, Zap, Shield } from 'lucide-react';
import { getRarityBadgeColor } from '@/services/gameData';

const RARITIES: Rarity[] = ['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'];

export function CollectionView() {
  const { collection } = useGameStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Rarity | 'All'>('All');
  const [sortBy, setSortBy] = useState<'added' | 'power' | 'defense' | 'rarity'>('added');
  const [selectedCard, setSelectedCard] = useState<MonsterCard | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const rarityWeight: Record<Rarity, number> = {
    'Common': 1,
    'Rare': 2,
    'Super Rare': 3,
    'Ultra Rare': 4,
    'Legendary': 5,
    'Mythic': 6
  };

  const filtered = collection
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

  if (collection.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🎴
        </motion.div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-400 mb-2">No Cards Yet</h3>
        <p className="text-slate-600 text-sm">Summon monsters to start your collection!</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter neon-text">My Collection</h2>
          <p className="text-slate-500 text-xs mt-1">{collection.length} cards collected</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl border ${viewMode === 'grid' ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-800 text-slate-500'}`}>
            <Grid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl border ${viewMode === 'list' ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-800 text-slate-500'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            placeholder="Search your monsters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-sky-400"
          />
        </div>
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-1.5 flex gap-1 relative overflow-hidden">
          {(['added', 'power', 'defense', 'rarity'] as const).map((s) => {
            const isActive = sortBy === s;
            return (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`flex-1 relative py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors z-10 ${
                  isActive ? 'text-slate-950' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sort-pill"
                    className="absolute inset-0 bg-gradient-to-br from-white to-slate-200 rounded-xl shadow-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-20">
                  {s === 'added' && <Search size={14} className={isActive ? 'text-slate-950' : ''} />}
                  {s === 'power' && <Zap size={14} className={isActive ? 'text-amber-500' : ''} />}
                  {s === 'defense' && <Shield size={14} className={isActive ? 'text-sky-600' : ''} />}
                  {s === 'rarity' && <Star size={14} className={isActive ? 'text-purple-600' : ''} />}
                </span>
                <span className="relative z-20 text-[8px] font-black uppercase tracking-widest">{s}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(['All', ...RARITIES] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                filter === r
                  ? 'bg-sky-500 border-sky-500 text-slate-950'
                  : 'border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Total" value={collection.length} />
        <StatBox label="Shiny" value={collection.filter((c) => c.isShiny).length} highlight />
        <StatBox label="Legendary+" value={collection.filter((c) => c.rarity === 'Legendary' || c.rarity === 'Mythic').length} />
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 -space-x-12 gap-y-24 justify-items-center py-20 px-10"
          >
            {filtered.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <HoloCard
                  card={card}
                  size="md"
                  selected={selectedCard?.id === card.id}
                  onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {filtered.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
                className={`flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer hover:border-sky-500/50 ${
                  selectedCard?.id === card.id ? 'border-sky-400 bg-sky-500/5' : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <img
                  src={card.sprite}
                  alt={card.displayName}
                  className={`w-14 h-14 object-contain ${card.isShiny ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-black italic uppercase text-sm text-white truncate">{card.displayName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${getRarityBadgeColor(card.rarity)}`}>{card.rarity}</span>
                    {card.isShiny && <span className="text-amber-400 text-[8px] font-black">✦ SHINY</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: card.stars }).map((_, i) => (
                      <Star key={i} size={8} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold">ATK {card.attack}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-[2rem] p-6 space-y-4"
            >
              <div className="flex justify-center">
                <HoloCard card={selectedCard} size="md" showStats />
              </div>
              <div className="text-center">
                <div className="text-xl font-black italic uppercase tracking-tighter text-white">{selectedCard.displayName}</div>
                <div className="text-xs text-slate-500 mt-1">{selectedCard.specialMove}</div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: 'HP', val: selectedCard.hp },
                  { label: 'ATK', val: selectedCard.attack },
                  { label: 'DEF', val: selectedCard.defense },
                  { label: 'SPD', val: selectedCard.speed },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800 rounded-xl p-2">
                    <div className="text-[9px] text-slate-500 font-black uppercase">{s.label}</div>
                    <div className="text-sm font-black text-white">{s.val}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="w-full py-3 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase text-xs tracking-widest"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`glass-panel !p-3 text-center ${highlight && value > 0 ? 'border-amber-400/30 bg-amber-500/5' : ''}`}>
      <div className={`text-xl font-black ${highlight && value > 0 ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider">{label}</div>
    </div>
  );
}
