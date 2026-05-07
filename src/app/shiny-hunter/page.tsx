'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlassPanel, NeonButton } from '@/components/UI';
import { Sparkles, Calculator, Zap, Search, ChevronRight, Info, Target, Activity, Sword } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { fetchAllPokemonNames } from '@/services/pokemon';

export default function ShinyHunterPage() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [selectedGame, setSelectedGame] = useState<'SV' | 'PLA' | 'PLZA'>('SV');
  const [targetPokemon, setTargetPokemon] = useState<any>(null);
  const [allPokemon, setAllPokemon] = useState<{name: string, id: number}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [simulationResult, setSimulationResult] = useState<'normal' | 'shiny' | null>(null);
  const [encounterCount, setEncounterCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [targetLocation, setTargetLocation] = useState<{ x: number, y: number, area: string } | null>(null);

  const habitatMapping: Record<string, string[]> = {
    SV: {
      Water: ["Casseroya Lake", "South Province (Area One)", "West Paldean Sea"],
      Fire: ["Asado Desert", "East Province (Area Three)"],
      Grass: ["Tagtree Thicket", "South Province (Area Two)"],
      Electric: ["Levincia District", "West Province (Area One)"],
      Ice: ["Glaseado Mountain"],
      Rock: ["South Province (Area Six)", "Asado Desert"],
      Ghost: ["Tagtree Thicket", "Montenevera"],
      Common: ["South Province", "East Province", "West Province"]
    },
    PLA: {
      Water: ["Cobalt Coastlands"],
      Fire: ["Cobalt Coastlands (Firespit Island)"],
      Grass: ["Obsidian Fieldlands"],
      Electric: ["Coronet Highlands"],
      Ice: ["Alabaster Icelands"],
      Rock: ["Crimson Mirelands", "Coronet Highlands"],
      Ghost: ["Obsidian Fieldlands (Night)", "Crimson Mirelands"],
      Common: ["Obsidian Fieldlands", "Crimson Mirelands"]
    },
    PLZA: {
      Water: ["Central Plaza", "Hibernal Avenue"],
      Fire: ["Autumnal Avenue"],
      Electric: ["Central Plaza", "Vernal Avenue"],
      Common: ["Central Plaza", "Vernal Avenue", "Estival Avenue"]
    }
  };

  useEffect(() => {
    if (targetPokemon) {
      const type = targetPokemon.types?.[0] || 'Common';
      const gameHabitats = habitatMapping[selectedGame];
      const validAreas = gameHabitats[type] || gameHabitats['Common'];
      
      setTargetLocation({
        x: Math.random() * 60 + 20,
        y: Math.random() * 60 + 20,
        area: validAreas[Math.floor(Math.random() * validAreas.length)]
      });
    }
  }, [targetPokemon, selectedGame]);

  useEffect(() => {
    fetchAllPokemonNames().then(setAllPokemon);
  }, []);

  const suggestions = allPokemon
    .filter(p => p.name.includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const handleSelectTarget = (p: any) => {
    setTargetPokemon(p);
    setIsSearching(false);
    setSearchQuery('');
  };

  const [hasShinyCharm, setHasShinyCharm] = useState(false);
  
  // Game Specific States
  const [outbreakLevel, setOutbreakLevel] = useState(0); // SV & PLA
  const [sandwichLevel, setSandwichLevel] = useState(0); // SV Only
  const [researchLevel, setResearchLevel] = useState(0); // PLA Only (0: Base, 1: Level 10, 2: Perfect)

  const calculateOdds = () => {
    let baseOdds = 4096;
    let rolls = 1;

    if (selectedGame === 'SV') {
      if (hasShinyCharm) rolls += 2;
      if (outbreakLevel === 1) rolls += 1;
      if (outbreakLevel === 2) rolls += 2;
      if (sandwichLevel === 3) rolls += 3;
    } else if (selectedGame === 'PLA') {
      // PLA Base is 1/4096 but mechanics are different
      if (researchLevel === 1) rolls += 1; // Level 10
      if (researchLevel === 2) rolls += 3; // Perfect
      if (hasShinyCharm) rolls += 3;
      if (outbreakLevel === 1) rolls += 25; // Mass Outbreak
      if (outbreakLevel === 2) rolls += 12; // Massive Mass Outbreak
    } else if (selectedGame === 'PLZA') {
      // Estimated for PLZA (Projected hybrid mechanics)
      if (hasShinyCharm) rolls += 3;
      rolls += 5; // Theoretical "Urban Density" bonus
    }

    return Math.floor(baseOdds / rolls);
  };

  const currentOdds = calculateOdds();
  const percentage = (1 / currentOdds) * 100;

  const getChartData = () => {
    if (selectedGame === 'PLA') {
      return [
        { name: 'Base', odds: 4096 },
        { name: 'Research 10', odds: 2048 },
        { name: 'Perfect Dex', odds: 1024 },
        { name: 'Shiny Charm', odds: 819 },
        { name: 'Mass Outbreak', odds: 158 },
        { name: 'CURRENT', odds: currentOdds },
      ].sort((a, b) => b.odds - a.odds);
    }
    return [
      { name: 'Base', odds: 4096 },
      { name: 'Charm', odds: 1365 },
      { name: 'Outbreak', odds: 1365 },
      { name: 'Sandwich', odds: 1024 },
      { name: 'ULTIMATE', odds: 512 },
      { name: 'CURRENT', odds: currentOdds },
    ].sort((a, b) => b.odds - a.odds);
  };

  const chartData = getChartData();

  const runSimulation = useCallback(() => {
    setIsRolling(true);
    setEncounterCount(prev => prev + 1);
    
    // Artificial delay for tension
    setTimeout(() => {
      const roll = Math.floor(Math.random() * currentOdds);
      setSimulationResult(roll === 0 ? 'shiny' : 'normal');
      setIsRolling(false);
    }, 300);
  }, [currentOdds]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Game Selector Bar */}
      <div className="flex gap-4 mb-8 p-1 bg-slate-900/50 border border-white/5 rounded-2xl w-fit">
        {[
          { id: 'SV', name: 'Scarlet & Violet', color: 'rose' },
          { id: 'PLA', name: 'Legends: Arceus', color: 'indigo' },
          { id: 'PLZA', name: 'Legends: Z-A', color: 'emerald' }
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedGame === game.id 
                ? `bg-${game.color}-500 text-slate-950 shadow-lg shadow-${game.color}-500/20` 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
              selectedGame === 'SV' ? 'bg-rose-500/10 border border-rose-400/30 text-rose-400' :
              selectedGame === 'PLA' ? 'bg-indigo-500/10 border border-indigo-400/30 text-indigo-400' :
              'bg-emerald-500/10 border border-emerald-400/30 text-emerald-400'
            }`}>
              {selectedGame === 'SV' ? 'Scarlet & Violet' : selectedGame === 'PLA' ? 'Legends: Arceus' : 'Legends: Z-A'} Protocol
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {selectedGame === 'PLZA' ? 'Future Intel Encrypted' : 'Database Live'}
            </span>
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter neon-text mb-4 uppercase">Shiny Intel Center</h1>
          <p className="text-slate-400 leading-relaxed">
            {selectedGame === 'SV' ? 
              'Specialized tactical simulator for Pokémon Scarlet & Violet. Configure your hunting gear and environmental factors.' :
              selectedGame === 'PLA' ?
              'Advanced Research Simulator for the Hisui Region. Calculate probabilities based on Research Levels and Mass Outbreaks.' :
              'Projected simulation for the urban redevelopment of Lumiose City. Data based on early field intel and urban density models.'
            }
          </p>
        </div>

        {/* Combat Deployment HUD */}
        <div className="w-full md:w-96">
          <GlassPanel className={`relative overflow-hidden border-${selectedGame === 'SV' ? 'rose' : selectedGame === 'PLA' ? 'indigo' : 'emerald'}-400/30 bg-slate-950`}>
            <div className="absolute top-0 right-0 p-2">
              <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Session Count: {encounterCount}</div>
            </div>
            
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 mb-4 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {targetPokemon ? (
                    <motion.div 
                      key={`${targetPokemon.id}-${simulationResult}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative"
                    >
                      <img 
                        src={simulationResult === 'shiny' ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${targetPokemon.id}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${targetPokemon.id}.png`}
                        className={`w-28 h-28 object-contain transition-all ${isRolling ? 'blur-sm grayscale' : ''} ${simulationResult === 'shiny' ? 'drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'drop-shadow-lg'}`}
                        alt="Target"
                      />
                      {simulationResult === 'shiny' && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.5, 1] }}
                          className="absolute -top-2 -right-2 text-amber-400"
                        >
                          <Sparkles size={24} className="animate-spin-slow" />
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-700">
                      <Target size={32} />
                    </div>
                  )}
                </AnimatePresence>
                {isRolling && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-12 h-12 border-4 border-${selectedGame === 'SV' ? 'rose' : 'sky'}-400 border-t-transparent rounded-full animate-spin`} />
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (!targetPokemon) {
                    setIsSearching(true);
                  } else {
                    runSimulation();
                  }
                }}
                disabled={isRolling}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${
                  !targetPokemon 
                    ? 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-sky-500/50 hover:text-sky-400' 
                    : simulationResult === 'shiny'
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                      : `bg-${selectedGame === 'SV' ? 'rose' : selectedGame === 'PLA' ? 'indigo' : 'emerald'}-500 text-slate-950 hover:opacity-90 shadow-xl`
                }`}
              >
                {targetPokemon && !isRolling && simulationResult !== 'shiny' && (
                  <motion.div 
                    layoutId="btn-pulse"
                    className="absolute inset-0 bg-white/20 animate-pulse"
                  />
                )}
                <Sword size={16} className={isRolling ? 'animate-bounce' : 'group-hover/btn:rotate-12 transition-transform'} />
                <span>
                  {!targetPokemon ? 'Select Target First' : simulationResult === 'shiny' ? 'SHINY ACQUIRED!' : 'Initiate Encounter'}
                </span>
              </button>
              
              {simulationResult === 'shiny' && (
                <button 
                  onClick={() => { setEncounterCount(0); setSimulationResult(null); }}
                  className="mt-3 text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                >
                  Reset Combat Session
                </button>
              )}
            </div>
          </GlassPanel>
          
          <div className="mt-4 flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Target</span>
            <button onClick={() => setIsSearching(true)} className="text-[10px] font-black text-sky-400 uppercase hover:underline">Change</button>
          </div>

          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 p-5 glass-panel z-50 shadow-[0_30px_60px_rgba(0,0,0,0.8)] w-[320px]"
              >
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search Database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-sky-400 transition-all"
                  />
                </div>
                <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {suggestions.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectTarget(p)}
                      className="p-3 rounded-2xl hover:bg-sky-500/10 cursor-pointer flex items-center gap-4 group transition-colors"
                    >
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                        alt={p.name}
                      />
                      <span className="text-xs font-black uppercase text-slate-400 group-hover:text-white transition-colors tracking-tight">{p.name}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsSearching(false)}
                  className="w-full mt-4 p-2 text-[10px] font-black uppercase text-slate-500 hover:text-rose-500 transition-colors border-t border-white/5"
                >
                  Cancel Selection
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step 1: Tactical Roadmap */}
        <div className="lg:col-span-3 space-y-6">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
            <ChevronRight size={12} /> Tactical Roadmap
          </div>
          
          <RoadmapStep 
            num="01" 
            title={selectedGame === 'PLA' ? "RESEARCH LEVEL" : "DEX COMPLETION"} 
            desc={selectedGame === 'PLA' ? "Achieve Perfect Dex status for specific targets (+3 Rolls)." : "Finish your National Pokedex to acquire the Shiny Charm (+2 Rolls)."}
            status={hasShinyCharm || researchLevel === 2 ? 'COMPLETED' : researchLevel === 1 ? 'PARTIAL' : 'PENDING'}
            active={hasShinyCharm || researchLevel > 0}
          />
          <RoadmapStep 
            num="02" 
            title={selectedGame === 'PLA' ? "OUTBREAK SCAN" : "OUTBREAK SCAN"} 
            desc={selectedGame === 'PLA' ? "Find Mass Outbreaks (+25 Rolls) or Massive Mass Outbreaks (+12 Rolls)." : "Find a Mass Outbreak and KO 60+ targets for Stage 2 odds (+2 Rolls)."}
            status={outbreakLevel === 2 ? 'COMPLETED' : outbreakLevel === 1 ? 'COMPLETED' : 'PENDING'}
            active={outbreakLevel > 0}
          />
          <RoadmapStep 
            num="03" 
            title={selectedGame === 'SV' ? "SANDWICH PREP" : "SHINY CHARM"} 
            desc={selectedGame === 'SV' ? "Use Herba Mystica to trigger Level 3 Sparkling Power (+3 Rolls)." : "Complete Hisui Dex to get the Charm (+3 Rolls)."}
            status={selectedGame === 'SV' ? (sandwichLevel === 3 ? 'COMPLETED' : sandwichLevel > 0 ? 'PARTIAL' : 'PENDING') : (hasShinyCharm ? 'COMPLETED' : 'PENDING')}
            active={selectedGame === 'SV' ? sandwichLevel > 0 : hasShinyCharm}
          />

          <GlassPanel className="bg-sky-500/5 border-sky-400/20">
            <h4 className="text-[10px] font-black uppercase text-sky-400 tracking-widest mb-2">System Insight</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "Every +1 Roll adds a 1/4096 chance to your encounter, effectively compressing the probability space."
            </p>
          </GlassPanel>
        </div>

        {/* Step 2: Live Simulator Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
            <ChevronRight size={12} /> Odds Simulator
          </div>

          <GlassPanel>
            <div className="space-y-8">
              <ToggleOption 
                label="Shiny Charm" 
                description={selectedGame === 'PLA' ? "Awarded by Cyllene after Dex completion" : "Permanent database enhancement"}
                active={hasShinyCharm} 
                onClick={() => setHasShinyCharm(!hasShinyCharm)} 
              />

              {/* Game Specific Controls */}
              {selectedGame === 'SV' && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Outbreak Phase</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${outbreakLevel === 2 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
                        {outbreakLevel === 2 ? 'MAX EFFICIENCY' : 'IDENTIFYING...'}
                      </span>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {[0, 1, 2].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setOutbreakLevel(lvl)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            outbreakLevel === lvl ? 'bg-rose-500 text-slate-950 shadow-xl' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {lvl === 0 ? 'None' : lvl === 1 ? '30+ KO' : '60+ KO'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Sparkling Power</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <Zap key={i} size={12} className={sandwichLevel >= i ? 'text-amber-400 fill-amber-400' : 'text-slate-800'} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {[0, 1, 2, 3].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setSandwichLevel(lvl)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            sandwichLevel === lvl ? 'bg-amber-500 text-slate-950 shadow-xl' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          Lvl {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedGame === 'PLA' && (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Outbreak Type</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${outbreakLevel === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                        {outbreakLevel === 1 ? 'MASSIVE BOOST' : 'SELECT TYPE'}
                      </span>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {[0, 1, 2].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setOutbreakLevel(lvl)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            outbreakLevel === lvl ? 'bg-indigo-500 text-slate-950 shadow-xl' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {lvl === 0 ? 'None' : lvl === 1 ? 'Mass' : 'Massive'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Research Level</span>
                      <div className="flex gap-1">
                        <Sparkles size={12} className={researchLevel >= 1 ? 'text-indigo-400' : 'text-slate-800'} />
                        {researchLevel === 2 && <Sparkles size={12} className="text-indigo-400" />}
                      </div>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                      {[0, 1, 2].map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setResearchLevel(lvl)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                            researchLevel === lvl ? 'bg-indigo-500 text-slate-950 shadow-xl' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {lvl === 0 ? 'Base' : lvl === 1 ? 'Lvl 10' : 'Perfect'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedGame === 'PLZA' && (
                <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="text-emerald-400" size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                    Urban Intel Encrypted. Detailed mechanics will unlock upon further Lumiose City redevelopment data.
                  </p>
                </div>
              )}
            </div>
          </GlassPanel>

          {/* Probability Gauge */}
          <GlassPanel className="relative overflow-hidden bg-slate-950/60 border-white/5">
            <div className={`absolute inset-0 bg-gradient-to-br from-${selectedGame === 'SV' ? 'rose' : selectedGame === 'PLA' ? 'indigo' : 'emerald'}-500/10 via-transparent to-amber-500/10`} />
            <div className="relative z-10 flex flex-col items-center text-center py-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Calculated Encounter Odds</span>
              <div className="text-7xl font-black italic tracking-tighter text-white mb-2 neon-text">
                1 / <motion.span key={currentOdds} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{currentOdds}</motion.span>
              </div>
              <div className={`text-xs font-black text-${selectedGame === 'SV' ? 'rose' : selectedGame === 'PLA' ? 'indigo' : 'emerald'}-400/80 tracking-widest uppercase mb-6`}>
                {(100 / currentOdds).toFixed(4)}% Success Rate
              </div>
              
              {/* Mission Status Badge */}
              <div className={`px-6 py-2 rounded-full border-2 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 transition-all ${
                currentOdds <= 512 ? 'bg-amber-500/10 border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Activity size={14} className={currentOdds <= 512 ? 'animate-pulse' : ''} />
                {currentOdds <= 512 ? 'MAXIMUM LIKELIHOOD DETECTED' : 'SYSTEM OPTIMIZATION PENDING'}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Step 3: Distribution & Geospatial Intel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
            <ChevronRight size={12} /> Geospatial Intel
          </div>

          <GlassPanel className="relative p-0 overflow-hidden group/map h-[400px]">
            {/* Map Image */}
            <div className="absolute inset-0 bg-slate-900">
              <img 
                src={selectedGame === 'SV' ? '/maps/paldea.png' : selectedGame === 'PLA' ? '/maps/hisui.png' : '/maps/lumiose.png'} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2000ms]"
                alt="Tactical Map"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute inset-0 border-[20px] border-slate-950/20" />
            </div>

            {/* Signal Ping */}
            <AnimatePresence>
              {targetLocation && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={`${targetLocation.x}-${targetLocation.y}`}
                  style={{ left: `${targetLocation.x}%`, top: `${targetLocation.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-sky-500/30 animate-ping absolute inset-0" />
                    <div className="w-4 h-4 rounded-full bg-sky-400 border-2 border-white shadow-[0_0_15px_rgba(56,189,248,0.8)] relative z-10" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                      <div className="px-2 py-1 bg-slate-950/80 border border-sky-400/50 rounded text-[8px] font-black text-sky-400 uppercase tracking-widest backdrop-blur-md">
                        SIGNAL DETECTED
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[8px] font-black text-sky-400 uppercase tracking-[0.2em]">Regional Scan</div>
                  <div className="text-xl font-black italic text-white uppercase tracking-tighter">
                    {selectedGame === 'SV' ? 'Paldea Sector' : selectedGame === 'PLA' ? 'Hisui Sector' : 'Lumiose District'}
                  </div>
                </div>
                <div className="bg-slate-950/60 backdrop-blur-md border border-white/5 p-2 rounded-lg text-right">
                  <div className="text-[8px] font-black text-slate-500 uppercase">Signal Latency</div>
                  <div className="text-[10px] font-black text-emerald-400">12ms (Optimal)</div>
                </div>
              </div>

              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl relative z-30 pointer-events-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Search Zone</div>
                    <div className="text-sm font-black italic text-sky-400 uppercase">
                      {targetLocation ? targetLocation.area : 'Scanning...'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Coordinates</div>
                    <div className="text-[10px] font-mono text-slate-300">
                      {targetLocation ? `${targetLocation.x.toFixed(1)}°N / ${targetLocation.y.toFixed(1)}°E` : '0.0 / 0.0'}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]" 
                  />
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="p-4 bg-slate-900/40">
              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Terrain Data</div>
              <div className="text-[10px] font-bold text-slate-300 uppercase">Aerial Mapping 98%</div>
            </GlassPanel>
            <GlassPanel className="p-4 bg-slate-900/40">
              <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Weather Sync</div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Clear Skies</div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoadmapStep({ num, title, desc, status, active }: { num: string, title: string, desc: string, status: string, active: boolean }) {
  return (
    <div className={`relative p-5 rounded-[2rem] border transition-all duration-500 ${
      active ? 'bg-sky-500/5 border-sky-500/30 shadow-[0_0_20px_rgba(56,189,248,0.1)]' : 'bg-slate-900/50 border-slate-800 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-black tracking-widest ${active ? 'text-sky-400' : 'text-slate-600'}`}>{num}</span>
        <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
          status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 
          status === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
        }`}>
          {status}
        </div>
      </div>
      <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${active ? 'text-white' : 'text-slate-500'}`}>{title}</h4>
      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function RecipeItem({ name, ingredients, description }: { name: string, ingredients?: string[], description?: string }) {
  return (
    <div className="p-4 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-sky-400/30 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase text-slate-200 tracking-wider group-hover:text-sky-400 transition-colors">{name}</span>
        <Zap size={14} className="text-slate-600 group-hover:text-amber-400 transition-all" />
      </div>
      {ingredients && (
        <div className="flex flex-wrap gap-1.5">
          {ingredients.map(ing => (
            <span key={ing} className="text-[8px] bg-slate-800/80 px-2 py-0.5 rounded-lg text-slate-400 uppercase font-bold border border-slate-700/50">{ing}</span>
          ))}
        </div>
      )}
      {description && <p className="text-[10px] text-slate-500 leading-tight italic">{description}</p>}
    </div>
  );
}

function ToggleOption({ label, description, active, onClick }: { label: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onClick}>
      <div>
        <div className={`text-sm font-bold uppercase tracking-wider transition-colors ${active ? 'text-sky-400' : 'text-slate-300'}`}>{label}</div>
        <div className="text-[10px] text-slate-500">{description}</div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-sky-500/20 border border-sky-500/50' : 'bg-slate-800 border border-slate-700'}`}>
        <motion.div 
          animate={{ x: active ? 28 : 4 }}
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${active ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'bg-slate-600'}`} 
        />
      </div>
    </div>
  );
}
