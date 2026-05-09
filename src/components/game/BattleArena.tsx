'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { HoloCard } from './HoloCard';
import { Swords, Sparkles, Trophy, RotateCcw, Shield, Zap, Activity, Flame, Skull, CloudRain, Leaf, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SKILL_COLORS, ARENA_THEMES } from '@/services/gameData'; // I should move these to gameData or local
import { CaptureScreen } from './CaptureScreen';
import { getEffectiveness } from '@/services/gameData';

// Local copy of skill colors for VFX
const LOCAL_SKILL_COLORS: Record<string, { bg: string; text: string; icon: any; vfx: string }> = {
  fire:     { bg: 'from-orange-500 to-red-600', text: 'text-white', icon: <Flame size={20} />, vfx: 'bg-orange-500' },
  water:    { bg: 'from-blue-500 to-cyan-600', text: 'text-white', icon: <CloudRain size={20} />, vfx: 'bg-cyan-400' },
  grass:    { bg: 'from-green-500 to-emerald-600', text: 'text-white', icon: <Leaf size={20} />, vfx: 'bg-green-400' },
  electric: { bg: 'from-yellow-400 to-amber-500', text: 'text-slate-950', icon: <Zap size={20} />, vfx: 'bg-yellow-300' },
  poison:   { bg: 'from-purple-500 to-indigo-600', text: 'text-white', icon: <Skull size={20} />, vfx: 'bg-purple-500' },
  psychic:  { bg: 'from-pink-500 to-rose-600', text: 'text-white', icon: <Sparkles size={20} />, vfx: 'bg-pink-400' },
  ice:      { bg: 'from-cyan-400 to-blue-500', text: 'text-white', icon: <Activity size={20} />, vfx: 'bg-blue-100' },
  dragon:   { bg: 'from-indigo-600 to-violet-700', text: 'text-white', icon: <Trophy size={20} />, vfx: 'bg-indigo-400' },
  default:  { bg: 'from-slate-500 to-slate-700', text: 'text-white', icon: <Swords size={20} />, vfx: 'bg-white' },
};

const LOCAL_ARENA_THEMES: Record<string, { bg: string; particles: string; name: string }> = {
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
  const { battle, applyPlayerTurn, applyEnemyTurn, resetBattle, setMode, arcadeSession, recordRoundResult, endArcadeSession, setCaptureTarget } = useGameStore();
  
  // VFX & Animation States
  const [playerAttackAnim, setPlayerAttackAnim] = useState(false);
  const [enemyAttackAnim, setEnemyAttackAnim] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [activeVfx, setActiveVfx] = useState<{ type: string; color: string; text?: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isTurnActive, setIsTurnActive] = useState(false);

  const playerType = battle.playerCard?.types[0] ?? 'default';
  const theme = LOCAL_ARENA_THEMES[playerType] ?? LOCAL_ARENA_THEMES.default;

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

    // ── PHASE 1: PLAYER ACTION ──
    if (type !== 'defend') {
      setPlayerAttackAnim(true);
      const vfxColor = (LOCAL_SKILL_COLORS[playerType] || LOCAL_SKILL_COLORS.default).vfx;
      
      // Calculate effectiveness for UI feedback
      const eff = getEffectiveness(battle.playerCard!.types, battle.enemyCard!.types);
      const effText = eff > 1 ? 'SUPER EFFECTIVE!' : eff < 1 && eff > 0 ? 'NOT VERY EFFECTIVE' : eff === 0 ? 'NO EFFECT!' : '';

      setTimeout(() => { 
        setActiveVfx({ type: type === 'attack' ? 'hit' : 'skill', color: vfxColor, text: effText });
        setShakeEnemy(true); 
        applyPlayerTurn(type); 
      }, 300);
    } else {
       applyPlayerTurn(type);
    }

    // ── PHASE 2: WAIT & ENEMY COUNTER ──
    setTimeout(() => {
      setPlayerAttackAnim(false);
      setActiveVfx(null);
      setShakeEnemy(false);
      
      const currentEnemyHp = useGameStore.getState().battle.enemyHp;
      if (currentEnemyHp > 0) {
         setTimeout(() => {
            setEnemyAttackAnim(true);
            const enemyType = battle.enemyCard?.types[0] || 'default';
            const enemyVfxColor = (LOCAL_SKILL_COLORS[enemyType] || LOCAL_SKILL_COLORS.default).vfx;
            
            const eEff = getEffectiveness(battle.enemyCard!.types, battle.playerCard!.types);
            const eEffText = eEff > 1 ? 'WEAKNESS EXPOSED!' : '';

            setTimeout(() => { 
              setActiveVfx({ type: 'hit', color: enemyVfxColor, text: eEffText });
              setShakePlayer(true); 
              applyEnemyTurn(); 
            }, 300);

            setTimeout(() => { 
               setEnemyAttackAnim(false); 
               setActiveVfx(null);
               setShakePlayer(false);
               setIsTurnActive(false); 
            }, 600);
         }, 400);
      } else {
         setIsTurnActive(false);
      }
    }, 600);
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
      {/* Background Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[size:100%_8px] pointer-events-none z-10" />

      {/* ── BATTLE HUD ── */}
      <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center z-50">
        <div className="flex justify-between w-full max-w-6xl items-center gap-12">
          {/* Player Sidebar */}
          <div className="flex-1">
             <div className={`bg-slate-950/80 border-4 rounded-3xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${shakePlayer ? 'border-white scale-105' : 'border-sky-500'}`}>
                <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-sky-500 rounded-full" />
                      <span className="text-lg font-black uppercase text-white tracking-tighter">{battle.playerCard?.displayName}</span>
                   </div>
                   <span className="text-sm font-black text-sky-400">{battle.playerHp} / {battle.playerCard?.hp}</span>
                </div>
                <div className="h-6 bg-slate-900 rounded-full overflow-hidden border-2 border-white/10 mb-3 p-1">
                   <motion.div animate={{ width: `${playerHpPct}%` }} className={`h-full bg-gradient-to-r rounded-full transition-colors ${playerHpPct < 30 ? 'from-rose-500 to-rose-400' : 'from-sky-600 to-sky-400'}`} />
                </div>
                <div className="flex gap-1.5 h-3">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`flex-1 h-full rounded-full transition-all duration-500 ${battle.playerEnergy >= (i+1)*20 ? 'bg-sky-400 shadow-[0_0_15px_#38bdf8]' : 'bg-white/10'}`} />
                   ))}
                </div>
             </div>
          </div>

          <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] z-20 border-8 border-slate-900">
                <span className="text-2xl font-black text-slate-900 italic">VS</span>
             </div>
          </div>

          {/* Enemy Sidebar */}
          <div className="flex-1 relative">
             <div className={`bg-slate-950/80 border-4 rounded-3xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${shakeEnemy ? 'border-white scale-105' : 'border-rose-500'}`}>
                <div className="flex justify-between items-end mb-2">
                   <div className="flex items-center gap-2">
                      <span className="text-lg font-black uppercase text-white tracking-tighter">{battle.enemyCard?.displayName}</span>
                      <div className="w-2 h-6 bg-rose-500 rounded-full" />
                   </div>
                   <span className="text-sm font-black text-rose-400">{battle.enemyHp} / {battle.enemyCard?.hp}</span>
                </div>
                <div className="h-6 bg-slate-900 rounded-full overflow-hidden border-2 border-white/10 mb-3 p-1">
                   <motion.div animate={{ width: `${enemyHpPct}%` }} className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" />
                </div>
                <div className="flex gap-1.5 h-3">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className={`flex-1 h-full rounded-full transition-all duration-500 ${battle.enemyEnergy >= (i+1)*20 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-white/10'}`} />
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex pt-24">
        
        {/* ── PLAYER POKEMON ── */}
        <div className="flex-1 flex items-center justify-center relative z-30">
          <AnimatePresence>
            {battle.playerCard && (
              <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative">
                <motion.div
                  animate={shakePlayer ? { x: [-15, 15, -15, 15, 0], filter: ['brightness(2)', 'brightness(1)'] } : { y: [0, -20, 0] }}
                  transition={shakePlayer ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <motion.img
                    src={battle.playerCard.artworkUrl}
                    alt="Player"
                    className="w-[36rem] h-[36rem] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                    initial={{ scaleX: -1 }}
                    animate={playerAttackAnim ? { x: [0, 250, 0], scale: [1, 1.15, 1], scaleX: -1 } : { scaleX: -1 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  />

                  {/* SHIELD EFFECT */}
                  <AnimatePresence>
                    {battle.isDefending && (
                       <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                       >
                          <div className="relative">
                             <div className="absolute inset-0 bg-sky-400/20 blur-[80px] rounded-full animate-pulse" />
                             <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                               className="w-96 h-96 border-4 border-dashed border-sky-400/30 rounded-full flex items-center justify-center"
                             >
                                <Shield size={140} className="text-sky-400/80 drop-shadow-[0_0_30px_rgba(56,189,248,1)]" />
                             </motion.div>
                          </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── ENEMY POKEMON ── */}
        <div className="flex-1 flex items-center justify-center relative z-30">
          <AnimatePresence>
            {battle.enemyCard && (
              <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative">
                <motion.div
                  animate={shakeEnemy ? { x: [-15, 15, -15, 15, 0], filter: ['brightness(2)', 'brightness(1)'] } : { y: [0, -20, 0] }}
                  transition={shakeEnemy ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <motion.img
                    src={battle.enemyCard.artworkUrl}
                    alt="Enemy"
                    className="w-[30rem] h-[30rem] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                    animate={enemyAttackAnim ? { x: [0, -250, 0], scale: [1, 1.2, 1], scaleX: -1 } : { scaleX: -1 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── VFX & TEXT POPUPS (WEAKNESS/ADVANTAGE) ── */}
        <AnimatePresence>
          {activeVfx && (
            <div className={`absolute inset-0 z-50 pointer-events-none flex items-center justify-center ${playerAttackAnim ? 'translate-x-1/4' : '-translate-x-1/4'}`}>
              
              {/* IMPACT SPARK */}
              {activeVfx.type === 'hit' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 2, 0], rotate: [0, 90, 180] }} transition={{ duration: 0.3 }}>
                   <Sparkles size={200} className="text-white drop-shadow-[0_0_60px_#fff]" />
                </motion.div>
              )}

              {/* ELEMENTAL VFX */}
              {activeVfx.type === 'skill' && (
                <div className="relative">
                   {[...Array(24)].map((_, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], x: (Math.random()-0.5)*400, y: (Math.random()-0.5)*400 }}
                        transition={{ duration: 0.6, delay: i * 0.01 }} className={`absolute w-8 h-8 rounded-full blur-md ${activeVfx.color}`} />
                   ))}
                   <motion.div animate={{ scale: [0, 6, 0], opacity: [0, 0.4, 0] }} className={`w-40 h-40 rounded-full blur-[100px] ${activeVfx.color}`} />
                </div>
              )}

              {/* TEXT POPUP: EFFECTIVENESS (CRITICAL FEEDBACK FOR CHILDREN) */}
              <AnimatePresence>
                 {activeVfx.text && (
                   <motion.div 
                    initial={{ y: 50, opacity: 0, scale: 0.5 }} 
                    animate={{ y: -150, opacity: 1, scale: 1.2 }} 
                    exit={{ opacity: 0 }}
                    className="absolute z-[70] flex flex-col items-center"
                   >
                      <div className={`px-10 py-4 rounded-[2rem] border-4 border-white shadow-2xl ${activeVfx.text.includes('SUPER') ? 'bg-emerald-500' : activeVfx.text.includes('WEAKNESS') ? 'bg-rose-500 animate-bounce' : 'bg-slate-700'}`}>
                         <span className="text-3xl font-black text-white uppercase italic tracking-tighter">{activeVfx.text}</span>
                      </div>
                      {activeVfx.text.includes('SUPER') ? <TrendingUp size={60} className="text-emerald-400 mt-4 drop-shadow-lg" /> : <TrendingDown size={60} className="text-rose-400 mt-4 drop-shadow-lg" />}
                   </motion.div>
                 )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

        {/* ── DAMAGE NUMBERS ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
           <AnimatePresence>
            {battle.lastDamage && (
              <motion.div key={battle.turn + (activeVfx ? 'hit' : 'miss')} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: battle.isCritical ? 8 : 5, opacity: 1, y: -250 }} exit={{ opacity: 0 }} transition={{ duration: 1, ease: "backOut" }}
                className={`font-black italic tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${battle.isCritical ? 'text-yellow-400' : 'text-white'}`}
              >
                {battle.lastDamage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── ACTION CONTROLS ── */}
      <div className="p-10 bg-gradient-to-t from-black via-black/90 to-transparent z-[60]">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          
          {battle.phase === 'battling' && !showResult && (
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-8 w-full transition-opacity duration-300 ${isTurnActive ? 'opacity-20' : 'opacity-100'}`}>
              <SkillButton label="ATTACK!" desc="Normal Strike" detail={`ATK: ${battle.playerCard?.attack}`} cost={0} icon={<Swords size={32} />} color="from-red-600 to-rose-700" onClick={() => handlePerformAction('attack')} />
              <SkillButton label="DEFEND" desc="Guard Stance" detail={`DEF: ${battle.playerCard?.defense}`} cost={0} icon={<Shield size={32} />} color="from-blue-600 to-indigo-700" onClick={() => handlePerformAction('defend')} />
              <SkillButton label={battle.playerCard?.specialSkill || 'SPECIAL'} desc="Elemental Burst" detail="x1.6 DMG" cost={40} icon={(LOCAL_SKILL_COLORS[playerType] || LOCAL_SKILL_COLORS.default).icon} color={(LOCAL_SKILL_COLORS[playerType] || LOCAL_SKILL_COLORS.default).bg} energy={battle.playerEnergy} onClick={() => handlePerformAction('special')} />
              <SkillButton label={battle.playerCard?.specialMove || 'ULTIMATE'} desc="Finish Strike" detail="x2.5 DMG" cost={80} icon={<Trophy size={32} />} color="from-amber-400 to-orange-600" energy={battle.playerEnergy} onClick={() => handlePerformAction('signature')} />
            </div>
          )}

          {showResult && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-8">
              <h3 className={`text-8xl font-black italic uppercase tracking-tighter ${battle.phase === 'victory' ? 'text-amber-400 drop-shadow-[0_0_60px_rgba(251,191,36,0.8)]' : 'text-rose-500'}`}>
                {battle.phase === 'victory' ? 'BATTLE WON!' : 'BATTLE LOST!'}
              </h3>
              <button onClick={() => handleRoundEnd(battle.phase === 'victory' ? 'won' : 'lost')} className={`px-24 py-8 rounded-full font-black uppercase tracking-widest text-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-90 ${battle.phase === 'victory' ? 'bg-sky-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                {arcadeSession.rounds + 1 >= arcadeSession.maxRounds ? 'COMPLETE' : 'NEXT ROUND'}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {arcadeSession.captureTarget && <CaptureScreen pokemon={arcadeSession.captureTarget} onClose={() => endArcadeSession()} />}

      {/* ── TARGET SELECTION OVERLAY ── */}
      <AnimatePresence>
        {arcadeSession.isChoosingTarget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-12"
          >
             <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
                <h2 className="text-5xl font-black italic uppercase text-white tracking-tighter mb-4">Choose Your Target</h2>
                <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Select 1 of the 3 enemies you fought to capture</p>
             </motion.div>
             
             <div className="flex gap-12 max-w-7xl overflow-x-auto p-10 scrollbar-hide">
                {arcadeSession.enemies.slice(-3).map((enemyCard, idx) => (
                   <motion.button
                     key={enemyCard.id + idx}
                     initial={{ scale: 0.8, opacity: 0, y: 50 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     whileHover={{ scale: 1.05, y: -20 }}
                     onClick={() => setCaptureTarget(enemyCard)}
                     className="relative group shrink-0"
                   >
                      <div className="absolute -inset-4 bg-sky-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <HoloCard card={enemyCard} size="lg" showStats />
                      <div className="mt-8 flex flex-col items-center">
                         <div className="px-8 py-3 rounded-full bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] group-hover:bg-sky-500 group-hover:text-white transition-all shadow-2xl shadow-sky-500/20 border-4 border-slate-900">
                            SELECT TARGET
                         </div>
                      </div>
                   </motion.button>
                ))}
             </div>
             
             <div className="mt-12 opacity-20">
                <Trophy size={48} className="text-white" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkillButton({ label, desc, detail, cost, icon, color, onClick, energy = 100 }: { label: string, desc: string, detail: string, cost: number, icon: any, color: string, onClick: () => void, energy?: number }) {
  const isDisabled = energy < cost;
  return (
    <motion.button whileHover={isDisabled ? {} : { scale: 1.08, y: -15 }} whileTap={isDisabled ? {} : { scale: 0.92 }} onClick={onClick} disabled={isDisabled} className={`relative p-8 rounded-[3rem] border-8 flex flex-col items-center gap-2 text-center transition-all shadow-2xl ${isDisabled ? 'bg-slate-900/90 border-slate-800 opacity-20' : `bg-gradient-to-br ${color} border-white/30 hover:border-white shadow-[0_30px_60px_rgba(0,0,0,0.4)]`}`}>
      <div className={`p-4 rounded-3xl bg-black/30 ${isDisabled ? 'text-slate-800' : 'text-white'}`}>{icon}</div>
      <div className="flex flex-col w-full">
        <span className={`text-xl font-black uppercase tracking-tighter truncate ${isDisabled ? 'text-slate-800' : 'text-white'}`}>{label}</span>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{desc}</span>
        {!isDisabled && <span className="text-[11px] font-black text-white/90 uppercase mt-2 bg-black/30 px-3 py-1 rounded-full inline-block mx-auto">{detail}</span>}
      </div>
      {cost > 0 && <div className="absolute top-6 right-6 bg-black/60 px-4 py-2 rounded-full text-xs font-black text-white border-2 border-white/20">{cost}</div>}
    </motion.button>
  );
}
