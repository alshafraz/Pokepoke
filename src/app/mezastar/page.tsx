'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { BattleArena } from '@/components/game/BattleArena';
import { SummonPanel } from '@/components/game/SummonPanel';
import { CollectionView } from '@/components/game/CollectionView';
import { ArcadeMode } from '@/components/game/ArcadeMode';
import { Swords, Sparkles, Package, Star, Coins, Zap, Trophy, ChevronLeft, ShieldCheck, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const MODES = [
  {
    id: 'arcade',
    label: 'Arcade Battle',
    icon: '⚔️',
    desc: 'Quick battle — win coins & XP',
    color: 'from-sky-600 to-indigo-700',
    glow: 'shadow-sky-500/30',
  },
  {
    id: 'summon',
    label: 'Summon',
    icon: '🎴',
    desc: 'Pull cards — rare monsters await',
    color: 'from-violet-600 to-purple-800',
    glow: 'shadow-violet-500/30',
  },
  {
    id: 'collection',
    label: 'Collection',
    icon: '📚',
    desc: 'View your monster archive',
    color: 'from-emerald-600 to-teal-800',
    glow: 'shadow-emerald-500/30',
  },
] as const;

export default function MezastarPage() {
  const { currentMode, setMode, coins, level, xp, collection, battle, addCoins } = useGameStore();
  const [adminMode, setAdminMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleAdminTrigger = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 7) {
      setAdminMode(true);
      setClickCount(0);
    }
  };

  const xpRequired = level * 100;
  const xpPct = (xp / xpRequired) * 100;

  const isInGame = currentMode === 'battle';

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated BG grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Battle Arena — full-screen takeover */}
      <AnimatePresence>
        {isInGame && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50"
          >
            <BattleArena />
          </motion.div>
        )}
      </AnimatePresence>

      {!isInGame && (
        <div className="max-w-[1800px] mx-auto px-6 pb-32 pt-8">

          {/* ── HERO HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              🌟
            </motion.div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-400/30 rounded-full text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-4">
              <Star size={10} /> Monster Tag Battle Game
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-2">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                MEZASTAR
              </span>
            </h1>
            <p className="text-slate-500 text-sm">Collect. Battle. Conquer.</p>
          </motion.div>

          {/* ── PLAYER STATUS HUD ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel mb-8 !p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAdminTrigger}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20"
                >
                  🏆
                </motion.button>
                <div>
                  <div className="text-sm font-black text-white uppercase">Trainer</div>
                  <div className="text-xs text-slate-500 font-bold">Level {level} Hunter</div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-400/20 rounded-full">
                <span className="text-amber-400 font-black text-sm">🪙 {coins.toLocaleString()}</span>
              </div>
            </div>

            {/* Admin Secret Panel */}
            <AnimatePresence>
              {adminMode && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 mb-4 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sky-400 font-black text-[10px] uppercase tracking-widest">
                        <ShieldCheck size={14} /> Admin Neural Link
                      </div>
                      <button onClick={() => setAdminMode(false)} className="text-slate-500 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => addCoins(1000)}
                        className="py-2 rounded-xl bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-tighter hover:bg-sky-400"
                      >
                        +1,000 Coins
                      </button>
                      <button 
                        onClick={() => addCoins(10000)}
                        className="py-2 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-tighter hover:bg-amber-400"
                      >
                        +10,000 Coins
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* XP Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">EXP</span>
                <span className="text-[9px] font-black text-slate-400">{xp} / {xpRequired}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${xpPct}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <QuickStat label="Cards" value={collection.length} icon="🎴" />
              <QuickStat label="Shiny" value={collection.filter(c => c.isShiny).length} icon="✨" highlight />
              <QuickStat label="Legendary" value={collection.filter(c => c.rarity === 'Legendary' || c.rarity === 'Mythic').length} icon="⭐" />
            </div>
          </motion.div>

          {/* ── MODE SELECTION (when at menu) ── */}
          {currentMode === 'menu' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-4 mb-8"
            >
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Zap size={12} className="text-sky-400" /> Select Game Mode
              </div>
              {MODES.map((mode, i) => (
                <motion.button
                  key={mode.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMode(mode.id as any)}
                  className={`w-full relative overflow-hidden bg-gradient-to-r ${mode.color} rounded-3xl p-5 flex items-center gap-5 border border-white/10 shadow-xl ${mode.glow} shadow-lg group`}
                >
                  {/* Shimmer */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 + i }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                  />

                  <div className="text-4xl shrink-0">{mode.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-base font-black uppercase tracking-wide text-white">{mode.label}</div>
                    <div className="text-xs text-white/60 mt-0.5">{mode.desc}</div>
                  </div>
                  <ChevronLeft size={20} className="text-white/40 rotate-180 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ── SUB-PAGE HEADER when in a mode ── */}
          {currentMode !== 'menu' && currentMode !== 'battle' && (
            <div className="flex items-center gap-3 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('menu')}
                className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </motion.button>
              <div className="flex-1 h-px bg-white/5" />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {currentMode === 'arcade' ? '⚔️ Arcade' : currentMode === 'summon' ? '🎴 Summon' : '📚 Collection'}
              </div>
            </div>
          )}

          {/* ── SUB-PAGES ── */}
          <AnimatePresence mode="wait">
            {currentMode === 'arcade' && (
              <motion.div key="arcade" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <ArcadeMode />
              </motion.div>
            )}
            {currentMode === 'summon' && (
              <motion.div key="summon" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SummonPanel />
              </motion.div>
            )}
            {currentMode === 'collection' && (
              <motion.div key="collection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <CollectionView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── BOTTOM NAV BAR ── */}
      {!isInGame && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
        >
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="glass-panel !p-2 flex items-center justify-around rounded-3xl border-white/10 bg-slate-950/90 backdrop-blur-xl">
              {[
                { id: 'menu',       icon: '🏠', label: 'Home' },
                { id: 'arcade',     icon: '⚔️', label: 'Battle' },
                { id: 'summon',     icon: '🎴', label: 'Summon' },
                { id: 'collection', icon: '📚', label: 'Cards' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMode(item.id as any)}
                  className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${
                    currentMode === item.id
                      ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                      : 'text-slate-600 hover:text-slate-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function QuickStat({ label, value, icon, highlight }: { label: string; value: number; icon: string; highlight?: boolean }) {
  return (
    <div className={`text-center p-2 rounded-xl ${highlight && value > 0 ? 'bg-amber-500/5 border border-amber-400/20' : 'bg-slate-900/50'}`}>
      <div className="text-base">{icon}</div>
      <div className={`text-sm font-black ${highlight && value > 0 ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      <div className="text-[8px] text-slate-600 font-black uppercase">{label}</div>
    </div>
  );
}
