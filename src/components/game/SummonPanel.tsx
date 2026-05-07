'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { fetchRandomMonster, getRarityColor } from '@/services/gameData';
import { SummonAnimation } from './SummonAnimation';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { Sparkles, Star, Zap, Package } from 'lucide-react';

const SUMMON_PACKS = [
  { id: 'basic',  name: 'Basic Pack',    cost: 50,   icon: '📦', desc: 'Standard pull',         color: 'from-slate-700 to-slate-900', guaranteed: undefined },
  { id: 'rare',   name: 'Rare Pack',     cost: 150,  icon: '💎', desc: 'Rare+ guaranteed',       color: 'from-blue-700 to-blue-900',   guaranteed: 'Rare' as Rarity },
  { id: 'ultra',  name: 'Ultra Pack',    cost: 350,  icon: '🔥', desc: 'Ultra Rare+ guaranteed', color: 'from-rose-700 to-rose-900',   guaranteed: 'Ultra Rare' as Rarity },
  { id: 'legend', name: 'Legend Pack',   cost: 800,  icon: '⭐', desc: 'Legendary guaranteed',   color: 'from-amber-600 to-amber-900', guaranteed: 'Legendary' as Rarity },
  { id: 'mythic', name: '✨ MYTHIC',     cost: 2000, icon: '🌟', desc: 'Mythic guaranteed!',     color: 'from-pink-600 via-purple-700 to-cyan-800', guaranteed: 'Mythic' as Rarity },
];

export function SummonPanel() {
  const { coins, spendCoins, summonCard } = useGameStore();
  const [summoning, setSummoning] = useState(false);
  const [pendingCard, setPendingCard] = useState<MonsterCard | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🎴
        </motion.div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter neon-text mb-2">Monster Summon</h2>
        <p className="text-slate-400 text-sm">Spend coins to summon powerful monsters to your collection</p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-400/30 rounded-full">
          <span className="text-amber-400 font-black text-sm">🪙 {coins.toLocaleString()} Coins</span>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center py-3 px-6 bg-rose-500/10 border border-rose-400/40 rounded-2xl text-rose-400 font-black text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Packs Grid */}
      <div className="space-y-4">
        {SUMMON_PACKS.map((pack) => {
          const canAfford = coins >= pack.cost;
          return (
            <motion.button
              key={pack.id}
              whileHover={canAfford ? { scale: 1.02, x: 4 } : {}}
              whileTap={canAfford ? { scale: 0.98 } : {}}
              onClick={() => !summoning && handleSummon(pack)}
              disabled={!canAfford || summoning}
              className={`w-full relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r ${pack.color} p-5 flex items-center gap-5 transition-all
                ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-white/30 hover:shadow-xl'}`}
            >
              {/* Shimmer for mythic */}
              {pack.id === 'mythic' && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                />
              )}

              <div className="text-4xl shrink-0">{pack.icon}</div>

              <div className="flex-1 text-left">
                <div className="text-sm font-black uppercase tracking-widest text-white">{pack.name}</div>
                <div className="text-xs text-white/60 mt-0.5">{pack.desc}</div>
              </div>

              <div className={`px-4 py-2 rounded-2xl text-sm font-black ${canAfford ? 'bg-white/20 text-white' : 'bg-black/20 text-white/40'}`}>
                🪙 {pack.cost}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Rarity Chart */}
      <div className="glass-panel !p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Rarity Rates (Basic Pack)</h3>
        <div className="space-y-2">
          {[
            { name: 'Common',      pct: '50%', color: 'bg-slate-500' },
            { name: 'Rare',        pct: '25%', color: 'bg-blue-500' },
            { name: 'Super Rare',  pct: '12%', color: 'bg-violet-500' },
            { name: 'Ultra Rare',  pct: '8%',  color: 'bg-rose-500' },
            { name: 'Legendary',   pct: '4%',  color: 'bg-amber-500' },
            { name: 'Mythic',      pct: '1%',  color: 'bg-pink-500' },
          ].map((r) => (
            <div key={r.name} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${r.color} shrink-0`} />
              <div className="flex-1 text-xs font-bold text-slate-300">{r.name}</div>
              <div className="text-xs font-black text-slate-400">{r.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summon Animation Overlay */}
      <SummonAnimation card={pendingCard} onComplete={handleComplete} />
    </div>
  );
}
