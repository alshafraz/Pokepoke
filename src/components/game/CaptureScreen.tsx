'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, MonsterCard } from '@/store/useGameStore';
import { POKEBALLS, CAPTURE_RATES, PokeballType } from '@/services/gameData';
import { Sparkles, Coins, Inbox, Zap, AlertCircle } from 'lucide-react';

interface CaptureScreenProps {
  pokemon: MonsterCard;
  onClose: () => void;
}

export function CaptureScreen({ pokemon, onClose }: CaptureScreenProps) {
  const { addToCollection, addCoins, setMode, resetBattle, recordRoundResult, arcadeSession, endArcadeSession } = useGameStore();
  
  const [isCycling, setIsCycling] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [captured, setCaptured] = useState<'idle' | 'shaking' | 'success' | 'failed'>('idle');
  const [shakeCount, setShakeCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(20);
  
  const cycleInterval = useRef<NodeJS.Timeout | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const stopCycling = useCallback(() => {
    if (!isCycling) return;
    setIsCycling(false);
    if (cycleInterval.current) clearInterval(cycleInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    // Start Tense Sequence
    setCaptured('shaking');
    
    const ball = POKEBALLS[selectedIndex];
    const baseRate = CAPTURE_RATES[pokemon.rarity];
    const successRate = baseRate * ball.catchMultiplier;
    
    // Original game logic: 3 shakes
    let currentShake = 0;
    const interval = setInterval(() => {
      currentShake++;
      setShakeCount(currentShake);
      
      // Check if breaks free at this shake (random chance each shake)
      const breaksFree = Math.random() > Math.pow(successRate, 0.33);
      
      if (breaksFree && currentShake < 3) {
        clearInterval(interval);
        setTimeout(() => {
          setCaptured('failed');
          setShowResult(true);
        }, 800);
        return;
      }

      if (currentShake === 3) {
        clearInterval(interval);
        const finalSuccess = Math.random() < successRate;
        setTimeout(() => {
          setCaptured(finalSuccess ? 'success' : 'failed');
          setShowResult(true);
        }, 1000);
      }
    }, 1200); // 1.2s per shake for tension

  }, [isCycling, selectedIndex, pokemon.rarity]);

  useEffect(() => {
    if (isCycling) {
      // Slower cycle for better visibility
      cycleInterval.current = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % POKEBALLS.length);
      }, 250);

      timerInterval.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            stopCycling();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stopCycling();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (cycleInterval.current) clearInterval(cycleInterval.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCycling, stopCycling]);

  const handleNextRound = (status: 'captured' | 'escaped') => {
    recordRoundResult({ pokemonId: pokemon.id, status });
    resetBattle();
    
    if (arcadeSession.rounds + 1 >= arcadeSession.maxRounds) {
      endArcadeSession(); // Final round done, reset session and go to menu
    } else {
      setMode('arcade'); // Go back to selection for next round
    }
  };

  const handleKeep = () => {
    addToCollection(pokemon);
    handleNextRound('captured');
  };

  const handleTrade = () => {
    const value = Math.round(pokemon.cp * 0.5);
    addCoins(value);
    handleNextRound('captured');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6">
      {/* Background Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] transition-colors duration-1000 ${captured === 'success' ? 'bg-emerald-500/20' : captured === 'failed' ? 'bg-rose-500/20' : ''}`} />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2"
        >
          Capture Phase
        </motion.h2>
        <div className="px-4 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-bold text-sky-400 uppercase tracking-widest inline-flex items-center gap-2">
          <Zap size={12} className="animate-pulse" /> Chance to Capture {pokemon.displayName}
        </div>
      </div>

      {/* Timer */}
      {isCycling && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-8 w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center relative"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32" cy="32" r="28"
              fill="none" stroke="currentColor" strokeWidth="4"
              className="text-sky-500 transition-all duration-1000"
              strokeDasharray="176"
              strokeDashoffset={176 - (176 * timer) / 20}
            />
          </svg>
          <span className="text-xl font-black text-white">{timer}</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Pokemon Display */}
        <AnimatePresence mode="wait">
          {captured !== 'success' && (
            <motion.div
              key="pokemon"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isCycling ? 1 : [1, 1.1, 0.5, 0],
                opacity: isCycling ? 1 : [1, 1, 1, 0],
                y: isCycling ? 0 : [0, -20, 100, 100]
              }}
              transition={{ duration: 1.5 }}
              className="absolute"
            >
              <img 
                src={pokemon.artworkUrl} 
                alt={pokemon.name} 
                className="w-64 h-64 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              />
              <div className="mt-4 text-center">
                <span className="px-3 py-1 bg-black/40 rounded-lg text-xs font-black text-white uppercase border border-white/10">
                  {pokemon.rarity} • LV. {Math.floor(pokemon.cp / 100)}
                </span>
              </div>
            </motion.div>
          )}

          {/* Pokeball Animation */}
          {!isCycling && (
            <motion.div
              initial={{ y: 300, scale: 0.5, opacity: 0 }}
              animate={{ 
                y: (captured === 'success' || captured === 'shaking') ? [300, -100, 0] : [300, -100, 200],
                scale: 1,
                opacity: 1,
                rotate: captured === 'shaking' 
                  ? [0, -15, 15, -15, 15, 0] 
                  : (captured === 'success' ? [0, -10, 10, -10, 10, 0] : [0, 180])
              }}
              transition={{ 
                duration: captured === 'shaking' ? 0.6 : (captured === 'success' ? 2 : 1.5),
                times: [0, 0.4, 1],
                repeat: captured === 'shaking' ? Infinity : 0,
                repeatType: 'reverse'
              }}
              key={`ball-shake-${shakeCount}`}
              className="absolute z-20 flex flex-col items-center"
            >
              <div className={`relative group`}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 ${POKEBALLS[selectedIndex].glow} bg-current`} />
                
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${POKEBALLS[selectedIndex].color} border-4 border-black/40 flex items-center justify-center relative overflow-hidden shadow-2xl`}>
                  <img 
                    src={POKEBALLS[selectedIndex].sprite} 
                    alt={POKEBALLS[selectedIndex].name} 
                    className="w-20 h-20 object-contain z-10"
                  />
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
                  <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/40 -translate-y-1/2" />
                </div>
                
                {/* Shake Counter Dots */}
                {captured === 'shaking' && (
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div 
                        key={s} 
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${s <= shakeCount ? 'bg-amber-400' : 'bg-white/20'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className="mt-8 text-white font-black uppercase italic tracking-widest text-lg drop-shadow-md">
                {POKEBALLS[selectedIndex].name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {isCycling && (
          <div className="absolute bottom-0 w-full flex justify-center items-center gap-6">
            {POKEBALLS.map((ball, i) => (
              <motion.div
                key={ball.id}
                animate={{
                  scale: selectedIndex === i ? 1.6 : 0.7,
                  opacity: selectedIndex === i ? 1 : 0.3,
                  y: selectedIndex === i ? -30 : 0,
                  rotate: selectedIndex === i ? [0, 10, -10, 0] : 0
                }}
                className="relative"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${ball.color} border-2 border-white/30 flex items-center justify-center ${selectedIndex === i ? ball.glow : ''}`}>
                  <img src={ball.sprite} alt={ball.name} className="w-8 h-8 object-contain" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stop Button */}
      {isCycling && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopCycling}
            className="px-12 py-4 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-3"
          >
            <Zap size={20} fill="currentColor" /> STOP!
          </motion.button>
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]"
          >
            Press Space Bar
          </motion.div>
        </div>
      )}

      {/* Results Overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <div className={`w-full max-w-sm rounded-[3rem] p-8 border-2 text-center overflow-hidden relative ${
              captured === 'success' ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-rose-950/40 border-rose-500/50'
            }`}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                captured === 'success' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.5)]' : 'bg-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.5)]'
              }`}>
                {captured === 'success' ? <Sparkles size={40} /> : <AlertCircle size={40} />}
              </div>

              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
                {captured === 'success' ? 'Captured!' : 'Escaped!'}
              </h3>
              <p className="text-slate-400 text-sm mb-8">
                {captured === 'success' 
                  ? `Congratulations! ${pokemon.displayName} is now yours.` 
                  : `The ${pokemon.displayName} broke free and fled into the wild.`}
              </p>

              {captured === 'success' ? (
                <div className="grid gap-3">
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={handleKeep}
                    className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    <Inbox size={18} /> Add to Collection
                  </motion.button>
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={handleTrade}
                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Coins size={18} /> Trade for {Math.round(pokemon.cp * 0.5)} 🪙
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleNextRound('escaped')}
                  className="w-full py-4 bg-rose-500 text-white font-black uppercase rounded-2xl shadow-lg shadow-rose-500/20"
                >
                  {arcadeSession.rounds + 1 >= arcadeSession.maxRounds ? 'Finish Session' : 'Next Round'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
