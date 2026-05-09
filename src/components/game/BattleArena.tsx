'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { Swords, Sparkles, Trophy, RotateCcw, Shield, Zap, Activity, Flame, Skull, CloudRain, Leaf, User, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TYPE_GRADIENT } from '@/services/gameData';
import { CaptureScreen } from './CaptureScreen';

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

const SKILL_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  fire:     { bg: 'from-orange-500 to-red-600', text: 'text-white', icon: <Flame size={20} /> },
  water:    { bg: 'from-blue-500 to-cyan-600', text: 'text-white', icon: <CloudRain size={20} /> },
  grass:    { bg: 'from-green-500 to-emerald-600', text: 'text-white', icon: <Leaf size={20} /> },
  electric: { bg: 'from-yellow-400 to-amber-500', text: 'text-slate-950', icon: <Zap size={20} /> },
  poison:   { bg: 'from-purple-500 to-indigo-600', text: 'text-white', icon: <Skull size={20} /> },
  psychic:  { bg: 'from-pink-500 to-rose-600', text: 'text-white', icon: <Sparkles size={20} /> },
  ice:      { bg: 'from-cyan-400 to-blue-500', text: 'text-white', icon: <Activity size={20} /> },
  dragon:   { bg: 'from-indigo-600 to-violet-700', text: 'text-white', icon: <Trophy size={20} /> },
  default:  { bg: 'from-slate-500 to-slate-700', text: 'text-white', icon: <Swords size={20} /> },
};

export function BattleArena() {
  const { battle, performAction, resetBattle, addCoins, addXp, setMode, arcadeSession, recordRoundResult, endArcadeSession } = useGameStore();
  
  // Animation States
  const [playerAttackAnim, setPlayerAttackAnim] = useState(false);
  const [enemyAttackAnim, setEnemyAttackAnim] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [isHitting, setIsHitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isTurnActive, setIsTurnActive] = useState(false);

  const playerType = battle.playerCard?.types[0] ?? 'default';
  const theme = ARENA_THEMES[playerType] ?? ARENA_THEMES.default;

  const enemyHpPct = battle.enemyCard ? (battle.enemyHp / battle.enemyCard.hp) * 100 : 0;
  const playerHpPct = battle.playerCard ? (battle.playerHp / battle.playerCard.hp) * 100 : 0;

  useEffect(() => {
    if (battle.phase === 'victory' || battle.phase === 'defeat') {
      const timer = setTimeout(() => setShowResult(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [battle.phase]);

  const handlePerformAction = (type: 'attack' | 'defend' | 'special' | 'signature') => {
    if (battle.phase !== 'battling' || showResult || isTurnActive) return;

    setIsTurnActive(true);

    // ── STEP 1: PLAYER ATTACK SEQUENCE ──
    if (type !== 'defend') {
      setPlayerAttackAnim(true);
      setTimeout(() => { setIsHitting(true); setShakeEnemy(true); }, 300);
    }

    // ── STEP 2: APPLY DATA & START ENEMY COUNTER ──
    setTimeout(() => {
      setPlayerAttackAnim(false);
      setIsHitting(false);
      setShakeEnemy(false);
      
      // Update logic (this updates HP in store)
      performAction(type);

      // If enemy is still alive, trigger counter attack animation
      if (battle.enemyHp > 10) { // Check before update is risky but visually we want the sequence
         setTimeout(() => {
            setEnemyAttackAnim(true);
            setTimeout(() => { setShakePlayer(true); }, 300);
            setTimeout(() => { 
               setEnemyAttackAnim(false); 
               setShakePlayer(false);
               setIsTurnActive(false); // Turn finished
            }, 600);
         }, 500);
      } else {
         setIsTurnActive(false);
      }
    }, 600);
  };

  const handleFlee = () => {
    if (arcadeSession.maxRounds > 0) {
      recordRoundResult({ pokemonId: battle.enemyCard?.id || 'unknown', status: 'skipped' });
      if (arcadeSession.rounds + 1 >= arcadeSession.maxRounds) endArcadeSession();
      else { resetBattle(); setMode('arcade'); }
    } else { resetBattle(); setMode('menu'); }
  };

  const handleRoundEnd = (status: 'won' | 'lost') => {
    const isFinalRound = arcadeSession.rounds + 1 >= arcadeSession.maxRounds;
    const currentWins = status === 'won' ? arcadeSession.wins + 1 : arcadeSession.wins;
    recordRoundResult({ pokemonId: battle.enemyCard?.id || 'unknown', status: status === 'won' ? 'won' : 'lost' }, battle.enemyCard || undefined);
    resetBattle();
    if (isFinalRound) { if (currentWins < 2) endArcadeSession(); } else { setMode('arcade'); }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg} flex flex-col relative overflow-hidden font-sans`}>
      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[size:100%_4px] pointer-events-none z-10" />

      {/* ── CENTER DIVIDER ── */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-20">
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.4, 0.1],
            backgroundColor: shakeEnemy ? '#f43f5e' : (shakePlayer ? '#ffffff' : '#38bdf8'),
            boxShadow: shakeEnemy ? '0 0 30px rgba(244,63,94,1)' : (shakePlayer ? '0 0 50px #fff' : '0 0 30px rgba(56,189,248,1)')
          }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="h-full w-1 blur-[4px]"
        />
      </div>

      {/* ── HEADER HUD ── */}
      <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center z-50">
        <div className="flex justify-between w-full max-w-6xl items-center gap-12">
          
          {/* Player HUD */}
          <div className="flex-1">
             <div className={`bg-slate-950/80 border-4 rounded-3xl p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${shakePlayer ? 'border-white scale-105 shadow-white/50' : 'border-sky-500'}`}>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-base font-black uppercase text-sky-400 tracking-tighter">{battle.playerCard?.displayName}</span>
                   <span className="text-xs font-black text-white">{battle.playerHp} HP</span>
                </div>
                <div className="h-5 bg-slate-900 rounded-full overflow-hidden border-2 border-white/10 mb-2 p-0.5">
                   <motion.div animate={{ width: `${playerHpPct}%` }} className={`h-full bg-gradient-to-r rounded-full ${playerHpPct < 30 ? 'from-rose-500 to-rose-400' : 'from-sky-600 to-sky-400'}`} />
                </div>
                <div className="flex gap-1 h-2.5">
                   {[...Array(5)].map((_, i) => (
                     <motion.div key={i} animate={battle.playerEnergy >= (i+1)*20 ? { opacity: 1, backgroundColor: '#38bdf8', scale: 1 } : { opacity: 0.2, backgroundColor: '#ffffff', scale: 0.9 }}
                       className="flex-1 h-full rounded-full shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
                   ))}
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center">
             <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full border-4 border-white flex items-center justify-center shadow-2xl z-20">
                <span className="text-2xl font-black text-white italic">VS</span>
             </div>
             <div className="mt-2 px-4 py-1 bg-black/60 rounded-full border border-white/20">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Round {arcadeSession.rounds + 1}</span>
             </div>
          </div>

          {/* Enemy HUD */}
          <div className="flex-1 relative">
             <div className={`bg-slate-950/80 border-4 rounded-3xl p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${shakeEnemy ? 'border-white scale-105 shadow-white/50' : 'border-rose-500'}`}>
                <div className="flex justify-between items-end mb-2">
                   <span className="text-base font-black uppercase text-rose-400 tracking-tighter">{battle.enemyCard?.displayName}</span>
                   <span className="text-xs font-black text-white">{battle.enemyHp} HP</span>
                </div>
                <div className="h-5 bg-slate-900 rounded-full overflow-hidden border-2 border-white/10 mb-2 p-0.5">
                   <motion.div animate={{ width: `${enemyHpPct}%` }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" />
                </div>
                <div className="flex gap-1 h-2.5">
                   {[...Array(5)].map((_, i) => (
                     <motion.div key={i} animate={battle.enemyEnergy >= (i+1)*20 ? { opacity: 1, backgroundColor: '#f43f5e', scale: 1 } : { opacity: 0.2, backgroundColor: '#ffffff', scale: 0.9 }}
                       className="flex-1 h-full rounded-full shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ── BATTLEFIELD ── */}
      <div className="flex-1 flex pt-24">
        
        {/* Player Side (Left) */}
        <div className="flex-1 flex items-center justify-center relative z-30">
          <AnimatePresence>
            {battle.playerCard && (
              <motion.div 
                initial={{ x: -200, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                className="relative"
              >
                <motion.div
                  animate={shakePlayer ? { x: [-15, 15, -15, 15, 0], filter: ['brightness(2)', 'brightness(1)'] } : { y: [0, -20, 0], rotate: [0, 2, 0] }}
                  transition={shakePlayer ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <motion.img
                    src={battle.playerCard.artworkUrl}
                    alt="Player"
                    className="w-[34rem] h-[34rem] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                    initial={{ scaleX: -1 }}
                    animate={playerAttackAnim ? { x: [0, 250, 0], scale: [1, 1.15, 1], scaleX: -1 } : { scaleX: -1 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = battle.playerCard!.sprite; }}
                  />
                  {battle.isDefending && (
                     <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }}
                      className="absolute inset-0 bg-sky-500/30 rounded-full blur-[100px]" />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enemy Side (Right) */}
        <div className="flex-1 flex items-center justify-center relative z-30">
          <AnimatePresence>
            {battle.enemyCard && (
              <motion.div 
                initial={{ x: 200, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                className="relative"
              >
                <motion.div
                  animate={shakeEnemy ? { x: [-15, 15, -15, 15, 0], filter: ['brightness(2)', 'brightness(1)'] } : { y: [0, -20, 0], rotate: [0, -2, 0] }}
                  transition={shakeEnemy ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <motion.img
                    src={battle.enemyCard.artworkUrl}
                    alt="Enemy"
                    className="w-[28rem] h-[28rem] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                    animate={enemyAttackAnim ? { x: [0, -250, 0], scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = battle.enemyCard!.sprite; }}
                    style={{ transform: 'scaleX(1)' }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ALIGNED LABELS ROW */}
        <div className="absolute bottom-[28%] left-0 right-0 px-24 flex justify-between z-40 pointer-events-none">
           <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 bg-sky-500 border-4 border-white px-8 py-2 rounded-full shadow-[0_10px_30px_rgba(56,189,248,0.5)]"
           >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                 <span className="text-[10px] font-black text-sky-500">1P</span>
              </div>
              <span className="text-xs font-black text-white uppercase tracking-widest italic">YOU</span>
           </motion.div>

           <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-3 bg-rose-500 border-4 border-white px-8 py-2 rounded-full shadow-[0_10px_30px_rgba(244,63,94,0.5)]"
           >
              <span className="text-xs font-black text-white uppercase tracking-widest italic">CPU</span>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                 <span className="text-[10px] font-black text-rose-500">EN</span>
              </div>
           </motion.div>
        </div>

        {/* Action Overlay */}
        <AnimatePresence>
          {(isHitting || enemyAttackAnim) && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [1, 4, 0], opacity: [1, 0.8, 0] }}
                className={`w-80 h-80 rounded-full blur-[100px] ${enemyAttackAnim ? 'bg-rose-500' : 'bg-white'}`} />
            </div>
          )}
        </AnimatePresence>

        {/* Cinematic Damage */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
           <AnimatePresence>
            {battle.lastDamage && (
              <motion.div key={battle.turn} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: battle.isCritical ? 6 : 4, opacity: 1, y: -200 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "backOut" }}
                className={`font-black italic tracking-tighter drop-shadow-2xl ${battle.isCritical ? 'text-yellow-400' : 'text-white'}`}
              >
                {battle.lastDamage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FOOTER CONTROLS ── */}
      <div className="p-8 bg-gradient-to-t from-black via-black/90 to-transparent z-[60]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          
          {battle.phase === 'battling' && !showResult && (
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-8 w-full transition-opacity duration-300 ${isTurnActive ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
              <SkillButton 
                label="ATTACK!" 
                desc="Basic Strike" 
                detail={`ATK: ${battle.playerCard?.attack}`}
                cost={0} 
                icon={<Swords size={28} />} 
                color="from-red-600 to-rose-700" 
                onClick={() => handlePerformAction('attack')} 
              />
              <SkillButton 
                label="DEFEND" 
                desc="Guard Mode" 
                detail={`DEF: ${battle.playerCard?.defense} (+🛡️)`}
                cost={0} 
                icon={<Shield size={28} />} 
                color="from-blue-600 to-indigo-700" 
                onClick={() => handlePerformAction('defend')} 
              />
              <SkillButton 
                label={battle.playerCard?.specialSkill || 'SPECIAL'} 
                desc="Strong Skill" 
                detail={`DMG: ${Math.round((battle.playerCard?.attack || 0) * 1.6)}`}
                cost={40} 
                icon={(SKILL_COLORS[battle.playerCard?.types[0] || 'default'] || SKILL_COLORS.default).icon} 
                color={(SKILL_COLORS[battle.playerCard?.types[0] || 'default'] || SKILL_COLORS.default).bg} 
                energy={battle.playerEnergy}
                onClick={() => handlePerformAction('special')} 
              />
              <SkillButton 
                label={battle.playerCard?.specialMove || 'ULTIMATE'} 
                desc="Finish Him!" 
                detail={`DMG: ${Math.round((battle.playerCard?.attack || 0) * 2.5)}`}
                cost={80} 
                icon={<Trophy size={28} />} 
                color="from-amber-400 to-orange-600" 
                energy={battle.playerEnergy}
                onClick={() => handlePerformAction('signature')} 
              />
            </div>
          )}

          {showResult && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-6">
              <h3 className={`text-7xl font-black italic uppercase tracking-tighter ${battle.phase === 'victory' ? 'text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.8)]' : 'text-rose-500'}`}>
                {battle.phase === 'victory' ? 'YOU WIN!' : 'OH NO! LOSE!'}
              </h3>
              <button onClick={() => handleRoundEnd(battle.phase === 'victory' ? 'won' : 'lost')} 
                className={`px-24 py-8 rounded-[3rem] font-black uppercase tracking-widest text-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-90 ${battle.phase === 'victory' ? 'bg-sky-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                {arcadeSession.rounds + 1 >= arcadeSession.maxRounds ? 'END GAME →' : 'NEXT FIGHT! →'}
              </button>
            </motion.div>
          )}

          {battle.phase === 'battling' && !showResult && (
             <button onClick={handleFlee} className="text-xs font-black uppercase text-slate-700 hover:text-white transition-colors tracking-[0.5em] mt-4">
                [ QUIT BATTLE ]
             </button>
          )}
        </div>
      </div>

      {arcadeSession.captureTarget && (
        <CaptureScreen pokemon={arcadeSession.captureTarget} onClose={() => endArcadeSession()} />
      )}
    </div>
  );
}

function SkillButton({ label, desc, detail, cost, icon, color, onClick, energy = 100 }: { label: string, desc: string, detail: string, cost: number, icon: any, color: string, onClick: () => void, energy?: number }) {
  const isDisabled = energy < cost;
  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: 1.1, y: -15, rotate: 1 }}
      whileTap={isDisabled ? {} : { scale: 0.9 }}
      onClick={onClick}
      disabled={isDisabled}
      className={`relative p-8 rounded-[3.5rem] border-8 flex flex-col items-center gap-2 text-center transition-all shadow-2xl ${
        isDisabled 
          ? 'bg-slate-900/90 border-slate-800 opacity-20 cursor-not-allowed' 
          : `bg-gradient-to-br ${color} border-white/40 hover:border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]`
      }`}
    >
      <div className={`p-4 rounded-3xl bg-black/20 shadow-inner ${isDisabled ? 'text-slate-800' : 'text-white'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-xl font-black uppercase tracking-tighter leading-none ${isDisabled ? 'text-slate-800' : 'text-white'}`}>{label}</span>
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1">{desc}</span>
        {!isDisabled && <span className="text-[10px] font-black text-white/90 uppercase mt-1 bg-black/20 px-2 py-0.5 rounded-full">{detail}</span>}
      </div>
      {cost > 0 && (
        <div className="absolute top-6 right-6 bg-black/50 px-4 py-1.5 rounded-full text-xs font-black text-white border-2 border-white/20">
          {cost}E
        </div>
      )}
    </motion.button>
  );
}
