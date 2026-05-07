'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { Swords, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TYPE_GRADIENT } from '@/services/gameData';

const ARENA_THEMES: Record<string, { bg: string; particles: string; name: string }> = {
  fire:     { bg: 'from-orange-950 via-red-950 to-slate-950', particles: 'bg-orange-500', name: '🔥 Inferno Arena' },
  water:    { bg: 'from-blue-950 via-cyan-950 to-slate-950',   particles: 'bg-cyan-400', name: '🌊 Ocean Coliseum' },
  electric: { bg: 'from-yellow-950 via-amber-950 to-slate-950', particles: 'bg-yellow-400', name: '⚡ Thunder Stadium' },
  grass:    { bg: 'from-green-950 via-emerald-950 to-slate-950', particles: 'bg-green-400', name: '🌿 Forest Arena' },
  psychic:  { bg: 'from-pink-950 via-rose-950 to-slate-950',   particles: 'bg-pink-400', name: '🔮 Psychic Realm' },
  dark:     { bg: 'from-slate-950 via-gray-950 to-black',      particles: 'bg-violet-500', name: '🌑 Shadow Citadel' },
  dragon:   { bg: 'from-indigo-950 via-violet-950 to-slate-950', particles: 'bg-indigo-400', name: '🐉 Dragon Sanctum' },
  ice:      { bg: 'from-cyan-950 via-blue-950 to-slate-950',   particles: 'bg-cyan-200', name: '❄️ Glacier Dome' },
  default:  { bg: 'from-slate-900 via-slate-950 to-black',     particles: 'bg-sky-400', name: '⚔️ Battle Arena' },
};

export function BattleArena() {
  const { battle, attackEnemy, resetBattle, addCoins, addXp, setMode } = useGameStore();
  const [attackAnim, setAttackAnim] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState<boolean | null>(null);

  const playerType = battle.playerCard?.types[0] ?? 'default';
  const theme = ARENA_THEMES[playerType] ?? ARENA_THEMES.default;

  const playerHpPct = battle.playerCard ? (battle.playerHp / battle.playerCard.hp) * 100 : 0;
  const enemyHpPct = battle.enemyCard ? (battle.enemyHp / battle.enemyCard.hp) * 100 : 0;

  const handleAttack = () => {
    if (battle.phase !== 'battling') return;
    setAttackAnim(true);
    setTimeout(() => { setShakeEnemy(true); }, 300);
    setTimeout(() => { setAttackAnim(false); setShakeEnemy(false); }, 700);
    attackEnemy();
  };

  const handleCapture = () => {
    const chance = battle.enemyHp / (battle.enemyCard?.hp ?? 100);
    const success = Math.random() > chance * 0.8;
    setCaptureSuccess(success);
    if (success) {
      addCoins(50); addXp(30);
      setTimeout(() => { resetBattle(); setMode('menu'); }, 2500);
    } else {
      setTimeout(() => setCaptureSuccess(null), 2000);
    }
  };

  const handleVictory = () => {
    addCoins(100); addXp(50);
    setTimeout(() => { resetBattle(); setMode('menu'); }, 500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} flex flex-col relative overflow-hidden`}>
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.03)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />

      {/* Arena Name */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <div className="px-6 py-2 bg-black/60 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white backdrop-blur-md">
          {theme.name}
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -800], opacity: [0, 0.6, 0] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: i * 0.5 }}
          className={`absolute w-1.5 h-1.5 rounded-full ${theme.particles} opacity-40 blur-[1px]`}
          style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
        />
      ))}

      {/* Enemy Side */}
      <div className="flex-1 flex flex-col items-center justify-end pb-8 pt-20">
        {battle.enemyCard && (
          <div className="flex flex-col items-center gap-4">
            {/* Enemy HP Bar */}
            <div className="w-64 bg-slate-900/80 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-black uppercase text-white">{battle.enemyCard.displayName}</span>
                <span className="text-xs font-black text-slate-400">{battle.enemyHp}/{battle.enemyCard.hp} HP</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${enemyHpPct}%` }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`h-full rounded-full ${enemyHpPct > 50 ? 'bg-emerald-500' : enemyHpPct > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
            </div>

            {/* Enemy Pokemon */}
            <motion.img
              src={battle.enemyCard.artworkUrl}
              alt={battle.enemyCard.displayName}
              className="w-52 h-52 object-contain drop-shadow-2xl"
              animate={shakeEnemy ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.3 }}
              onError={(e) => { (e.target as HTMLImageElement).src = battle.enemyCard!.sprite; }}
            />

            {/* Damage Number */}
            <AnimatePresence>
              {battle.lastDamage && (
                <motion.div
                  key={battle.turn}
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ y: -60, opacity: 0, scale: battle.isCritical ? 1.8 : 1.2 }}
                  transition={{ duration: 0.8 }}
                  className={`absolute text-4xl font-black ${battle.isCritical ? 'text-rose-400' : 'text-white'}`}
                >
                  {battle.isCritical ? `💥 ${battle.lastDamage}!` : `-${battle.lastDamage}`}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent mx-8" />

      {/* Player Side */}
      <div className="flex items-end gap-6 px-8 pb-4 pt-6">
        {battle.playerCard && (
          <>
            <motion.img
              src={battle.playerCard.artworkUrl}
              alt={battle.playerCard.displayName}
              className="w-36 h-36 object-contain drop-shadow-2xl"
              animate={attackAnim ? { x: [0, 80, 0] } : {}}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onError={(e) => { (e.target as HTMLImageElement).src = battle.playerCard!.sprite; }}
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-black text-white uppercase">{battle.playerCard.displayName}</span>
                <span className="text-xs font-black text-slate-400">{battle.playerHp}/{battle.playerCard.hp} HP</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                <motion.div
                  animate={{ width: `${playerHpPct}%` }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`h-full rounded-full ${playerHpPct > 50 ? 'bg-sky-500' : playerHpPct > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
              </div>
              {/* Combo */}
              {battle.combo > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-black text-amber-400 uppercase mb-2"
                >
                  🔥 COMBO x{battle.combo}
                </motion.div>
              )}
              {/* Battle Log */}
              {battle.log[0] && (
                <div className="text-[10px] text-slate-400 font-medium truncate">{battle.log[0]}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-8 pb-8">
        {battle.phase === 'battling' && (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={handleAttack}
              className="py-4 rounded-2xl bg-sky-500 text-slate-950 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30"
            >
              <Swords size={18} /> Attack
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={resetBattle}
              className="py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-slate-700"
            >
              <RotateCcw size={18} /> Flee
            </motion.button>
          </div>
        )}

        {battle.phase === 'capture' && (
          <AnimatePresence>
            {captureSuccess === null ? (
              <motion.div key="capture-btns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="text-center text-sm font-black text-amber-400 uppercase tracking-widest mb-3">
                  ⚡ Enemy Weakened! Capture?
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleCapture}
                    className="py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Sparkles size={18} /> Capture!
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={handleVictory}
                    className="py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Trophy size={18} /> Victory!
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="capture-result"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`py-8 rounded-3xl text-center font-black text-2xl uppercase ${
                  captureSuccess ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-400' : 'bg-rose-500/20 border border-rose-400 text-rose-400'
                }`}
              >
                {captureSuccess ? '✅ Capture Success! +50 🪙' : '❌ Capture Failed!'}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {(battle.phase === 'victory' || battle.phase === 'defeat') && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
            <div className={`text-4xl font-black italic uppercase ${battle.phase === 'victory' ? 'text-amber-400' : 'text-rose-400'}`}>
              {battle.phase === 'victory' ? '🏆 VICTORY!' : '💀 DEFEAT'}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { resetBattle(); setMode('menu'); }}
              className="w-full py-4 rounded-2xl bg-sky-500 text-slate-950 font-black uppercase tracking-widest"
            >
              Back to Menu
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
