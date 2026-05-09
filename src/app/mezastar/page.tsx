'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { BattleArena } from '@/components/game/BattleArena';
import { SummonPanel } from '@/components/game/SummonPanel';
import { CollectionView } from '@/components/game/CollectionView';
import { ArcadeMode } from '@/components/game/ArcadeMode';
import { Swords, Sparkles, Package, Coins, User, ChevronLeft, Shield, Trophy, Zap } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { fetchRandomMonster } from '@/services/gameData';

// Pool of cool Pokemons for each category type
const TYPE_POOLS = {
  water:    [382, 9, 245, 658, 130, 484, 131, 384], // Kyogre, Blastoise, Suicune, Greninja, Gyarados, Palkia, Lapras
  fire:     [383, 6, 146, 244, 250, 257, 491, 157], // Groudon, Charizard, Moltres, Entei, Ho-Oh, Blaziken, Darkrai (Fire vibe), Typhlosion
  grass:    [251, 254, 389, 492, 3, 154, 470, 763], // Celebi, Sceptile, Torterra, Shaymin, Venusaur, Meganium, Leafeon, Tsareena
  electric: [145, 243, 644, 405, 26, 135, 785, 466], // Zapdos, Raikou, Zekrom, Luxray, Raichu, Jolteon, Tapu Koko, Electivire
};

const MODES_CONFIG = [
  {
    id: 'arcade',
    label: 'ARCADE BATTLE',
    sublabel: 'BATTLE ARENA',
    color: 'from-blue-600/40 to-blue-900/60',
    accent: 'bg-blue-500',
    icon: <Swords className="w-8 h-8" />,
    type: 'water',
  },
  {
    id: 'summon',
    label: 'GET POKEMON',
    sublabel: 'SUMMONING',
    color: 'from-red-600/40 to-red-900/60',
    accent: 'bg-red-500',
    icon: <Sparkles className="w-8 h-8" />,
    type: 'fire',
  },
  {
    id: 'collection',
    label: 'COLLECTION',
    sublabel: 'MY CARDS',
    color: 'from-emerald-600/40 to-emerald-900/60',
    accent: 'bg-emerald-500',
    icon: <Package className="w-8 h-8" />,
    type: 'grass',
  },
  {
    id: 'profile',
    label: 'TRAINER HUB',
    sublabel: 'YOUR PROGRESS',
    color: 'from-amber-500/40 to-amber-800/60',
    accent: 'bg-amber-500',
    icon: <User className="w-8 h-8" />,
    type: 'electric',
  },
] as const;

export default function MezastarPage() {
  const { currentMode, setMode, coins, level, xp, collection, addCoins, arcadeSession, addToCollection } = useGameStore();
  const [adminMode, setAdminMode] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // State for randomized images
  const [randomImages, setRandomImages] = useState<Record<string, string>>({});

  useEffect(() => {
    // Pick a random pokemon for each mode based on type pools
    const newImages: Record<string, string> = {};
    MODES_CONFIG.forEach(mode => {
      const pool = TYPE_POOLS[mode.type as keyof typeof TYPE_POOLS];
      const randomId = pool[Math.floor(Math.random() * pool.length)];
      newImages[mode.id] = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${randomId}.png`;
    });
    setRandomImages(newImages);
    setMounted(true);
  }, []);

  const handleAdminTrigger = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 7) {
      setAdminMode(true);
      setClickCount(0);
    }
  };

  const handleBulkSummon = async () => {
    // Summon 10 monsters at once
    for (let i = 0; i < 10; i++) {
       const monster = await fetchRandomMonster();
       addToCollection(monster);
    }
    setAdminMode(false);
  };

  const xpRequired = level * 100;
  const xpPct = (xp / xpRequired) * 100;
  const isInGame = currentMode === 'battle';

  return (
    <div className="h-screen w-full bg-[#010413] relative overflow-hidden font-sans text-slate-200 flex flex-col p-6">
      {/* ── CLEAN DARK BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:120px_120px]" />
      </div>

      <AnimatePresence>
        {isInGame && (
          <motion.div key="battle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
            <BattleArena />
          </motion.div>
        )}
      </AnimatePresence>

      {!isInGame && (
        <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full relative z-10 overflow-hidden">
          
          {/* ── TOP HUD (Slim, Non-Scroll) ── */}
          <div className="flex items-center justify-between mb-6 shrink-0">
             <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4">
                <div className="bg-red-600 px-8 py-2 rounded-2xl border-4 border-white shadow-2xl">
                   <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Mezastar</h1>
                </div>
                <div className="px-5 py-1.5 bg-sky-500/10 border border-sky-500/30 rounded-full text-[10px] font-black tracking-widest text-sky-400">ARCADE HUB</div>
             </motion.div>

             <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 bg-slate-900/60 border-2 border-white/10 rounded-[2rem] px-8 py-3 backdrop-blur-3xl">
                <div className="flex items-center gap-3 pr-6 border-r border-white/5">
                   <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                      <Coins size={20} className="text-amber-400" />
                   </div>
                    <span className="text-2xl font-black text-white leading-none">
                      {mounted ? coins.toLocaleString() : '---'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                   <button onClick={handleAdminTrigger} className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center border-2 border-white/20 shadow-xl">
                      <User size={24} className="text-white"/>
                   </button>
                   <div className="flex flex-col min-w-[100px]">
                      <div className="flex justify-between items-end mb-1">
                         <span className="text-xs font-black text-slate-500">LV.{level}</span>
                         <span className="text-xs font-black text-sky-400">{xp}%</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                         <motion.div animate={{ width: `${xpPct}%` }} className="h-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* ── 2x2 GRID MENU ── */}
          <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
             
             {currentMode === 'menu' || currentMode === 'profile' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full max-h-[800px]">
                   {MODES_CONFIG.map((mode, i) => (
                      <motion.button
                        key={mode.id}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, ease: "circOut" }}
                        whileHover={{ scale: 1.02, y: -10 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMode(mode.id as any)}
                        className={`group relative rounded-[4rem] border-4 border-white/10 bg-gradient-to-br ${mode.color} p-10 overflow-hidden flex flex-row items-center gap-10 text-left shadow-2xl transition-all h-full`}
                      >
                         {/* Holo Effect Overlay */}
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1)_0%,transparent_70%)] group-hover:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_0%,transparent_70%)] transition-all" />
                         
                         {/* Randomized Pokemon Image (Bottom-Left Burst Effect) */}
                         <div className="absolute -bottom-10 -left-10 w-[120%] h-[120%] flex items-end justify-start transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-4">
                            {randomImages[mode.id] ? (
                               <img 
                                 src={randomImages[mode.id]} 
                                 alt={mode.label} 
                                 className="w-full h-full object-contain opacity-40 group-hover:opacity-80 transition-all duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                               />
                            ) : (
                               <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
                            )}
                         </div>

                         {/* Proportional Text Info (Top-Right Focused) */}
                         <div className="relative z-20 flex-1 flex flex-col items-end justify-start w-full text-right">
                            <div className="flex flex-col items-end gap-4">
                               <div className={`w-20 h-20 rounded-[2rem] ${mode.accent} text-white shadow-2xl flex items-center justify-center group-hover:rotate-12 transition-transform border-4 border-white/20`}>
                                  {mode.icon}
                               </div>
                               <div>
                                  <div className="text-[14px] font-black text-white/40 uppercase tracking-[0.6em] leading-none mb-3">{mode.sublabel}</div>
                                  <h3 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">{mode.label}</h3>
                               </div>
                            </div>
                            
                            <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                               <span className="text-sm font-black uppercase text-white tracking-[0.3em] italic">Explore Mode</span>
                               <div className="h-1 w-12 bg-white/40 rounded-full" />
                            </div>
                         </div>

                         {/* Background Decor */}
                         <div className="absolute top-10 right-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            {mode.id === 'arcade' ? <Shield size={120} /> : mode.id === 'summon' ? <Sparkles size={120} /> : <Trophy size={120} />}
                         </div>
                      </motion.button>
                   ))}
                </div>
             ) : null}

             {/* Sub-Pages Header */}
             {currentMode !== 'menu' && currentMode !== 'profile' && (
                <div className="flex items-center justify-between mb-8 shrink-0">
                   <button onClick={() => setMode('menu')} className="px-12 py-5 bg-white/5 border-2 border-white/10 rounded-[2.5rem] text-lg font-black uppercase tracking-widest flex items-center gap-4 hover:bg-white/10 transition-all shadow-2xl backdrop-blur-3xl group">
                      <ChevronLeft size={24} className="group-hover:-translate-x-2 transition-transform" /> BACK TO MENU
                   </button>
                   <div className="px-10 py-3 bg-slate-900/40 border-2 border-white/10 rounded-full flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse shadow-[0_0_10px_rgba(56,189,248,1)]" />
                      <span className="text-sm font-black uppercase tracking-[0.4em] text-white/60 italic">{currentMode}</span>
                   </div>
                </div>
             )}

             {/* Sub-Pages Content */}
             <div className="flex-1 min-h-0">
                <AnimatePresence mode="wait">
                   <motion.div key={currentMode} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
                      {currentMode === 'arcade' && <ArcadeMode />}
                      {currentMode === 'summon' && <SummonPanel />}
                      {currentMode === 'collection' && <CollectionView />}
                   </motion.div>
                </AnimatePresence>
             </div>
          </div>
        </div>
      )}

      {/* Admin Console */}
      <AnimatePresence>
        {adminMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] border-4 border-sky-500 rounded-[4rem] p-16 max-md w-full shadow-2xl">
                <div className="flex justify-between items-center mb-12">
                   <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Trainer Console</h3>
                   <button onClick={() => setAdminMode(false)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronLeft size={28} /></button>
                </div>
                 <div className="space-y-4">
                    <button onClick={() => { addCoins(100000); setAdminMode(false); }} className="w-full py-8 bg-amber-500 text-slate-950 rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-amber-400 transition-all uppercase tracking-widest flex items-center justify-center gap-4">
                       <Coins size={32} /> GET 100,000 COINS
                    </button>
                    <button onClick={handleBulkSummon} className="w-full py-8 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-indigo-500 transition-all uppercase tracking-widest flex items-center justify-center gap-4">
                       <Zap size={32} /> BULK SUMMON (x10)
                    </button>
                 </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
