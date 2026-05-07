'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { fetchRandomMonster } from '@/services/gameData';
import { HoloCard } from './HoloCard';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Swords, RefreshCw, Shield } from 'lucide-react';

export function ArcadeMode() {
  const { collection, startBattle, setMode, selectedCard, selectCard } = useGameStore();
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
      const card = await fetchRandomMonster();
      setEnemy(card);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnemy(); }, []);

  const handleBattle = () => {
    if (!selectedCard || !enemy) return;
    startBattle(selectedCard, enemy);
    setMode('battle');
  };

  if (collection.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
        <div className="text-7xl">⚔️</div>
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-300 mb-2">No Monsters!</h3>
          <p className="text-slate-500 text-sm mb-6">Summon at least one monster to start battling</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={() => setMode('summon')}
            className="px-8 py-3 rounded-2xl bg-sky-500 text-slate-950 font-black uppercase tracking-widest text-sm"
          >
            Go Summon →
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter neon-text mb-1">Arcade Battle</h2>
        <p className="text-slate-500 text-sm">Face your destiny in the arena</p>
      </div>

      {/* VS Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Player Side */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest text-center">Your Fighter</div>
          {selectedCard ? (
            <div className="flex justify-center">
              <HoloCard card={selectedCard} size="md" showStats selected />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-52 h-72 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 gap-2">
                <Shield size={32} />
                <span className="text-xs font-black uppercase">Pick Below</span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Battle Button */}
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="text-6xl font-black italic text-slate-800 tracking-tighter opacity-50">VS</div>
          <motion.button
            whileHover={selectedCard && enemy ? { scale: 1.1, rotate: 5 } : {}}
            whileTap={selectedCard && enemy ? { scale: 0.9 } : {}}
            onClick={handleBattle}
            disabled={!selectedCard || !enemy || loading}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 transition-all ${
              selectedCard && enemy
                ? 'bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-[0_0_50px_rgba(225,29,72,0.6)] border-4 border-white'
                : 'bg-slate-900 text-slate-600 border-4 border-slate-800 cursor-not-allowed opacity-50'
            }`}
          >
            <Swords size={36} />
            <span className="text-[10px] font-black uppercase tracking-widest">Fight</span>
            
            {/* Animated Ring for ready state */}
            {selectedCard && enemy && (
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-white/50"
              />
            )}
          </motion.button>
        </div>

        {/* Enemy Side */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center w-full">Enemy</div>
          {loading ? (
            <div className="w-52 h-72 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full" />
            </div>
          ) : enemy ? (
            <div className="flex justify-center w-full">
              <HoloCard card={enemy} size="md" showStats />
            </div>
          ) : null}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={fetchEnemy}
            className="px-6 py-2 rounded-xl border border-slate-700 text-slate-400 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:border-sky-500/50"
          >
            <RefreshCw size={12} /> New Enemy
          </motion.button>
        </div>
      </div>

      {/* Select from collection */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Choose Your Fighter</div>
          <div className="flex gap-2">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 rounded-lg focus:border-sky-500 outline-none"
            >
              <option value="power">Sort: Power</option>
              <option value="defense">Sort: Defense</option>
              <option value="rarity">Sort: Rarity</option>
              <option value="added">Sort: Newest</option>
            </select>
            <select 
              value={rarityFilter} 
              onChange={(e) => setRarityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-[10px] font-black uppercase text-slate-400 px-3 py-1.5 rounded-lg focus:border-sky-500 outline-none"
            >
              <option value="All">All Rarity</option>
              {['Common', 'Rare', 'Super Rare', 'Ultra Rare', 'Legendary', 'Mythic'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex -space-x-12 overflow-x-auto scrollbar-hide py-12 px-10">
          {filteredCollection.map((card) => (
            <motion.div 
              key={card.id} 
              className="shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <HoloCard
                card={card}
                size="md"
                selected={selectedCard?.id === card.id}
                onClick={() => selectCard(card)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
