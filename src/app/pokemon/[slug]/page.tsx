'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemonDetail } from '@/services/pokemon';
import { Pokemon } from '@/types';
import { GlassPanel, NeonButton } from '@/components/UI';
import Image from 'next/image';
import { Sparkles, Activity, Shield, Zap, Wind, Clock, MapPin, Loader2, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemon';
import RadarStatistics from '@/components/Premium/RadarStatistics';

const Pokemon3D = dynamic(() => import('@/components/Pokemon3D'), { ssr: false });

import { Toaster, toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function PokemonDetailPage() {
  const { slug } = useParams();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showShiny, setShowShiny] = useState(false);

  const simulateEncounter = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setAttempts(prev => prev + 1);
    
    // Simulate high-speed scanning
    setTimeout(() => {
      const isShiny = Math.random() < 0.05; // 5% chance for demo, real is much lower
      
      if (isShiny) {
        setShowShiny(true);
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FFFFFF']
        });
        toast.success("SHINY ENCOUNTERED! ✨", {
          duration: 5000,
          style: {
            background: '#FFD700',
            color: '#000',
            fontWeight: '900',
            fontSize: '1.2rem'
          }
        });
      } else {
        toast("Normal encounter... trying again.", {
          icon: '🔍',
          style: { background: '#1e293b', color: '#94a3b8' }
        });
      }
      setIsSimulating(false);
    }, 1200);
  };
  const evoScrollRef = useRef<HTMLDivElement>(null);
  const tcgScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        setLoading(true);
        const data = await fetchPokemonDetail(slug as string);
        setPokemon(data);
      } catch (err) {
        console.error(err);
        setPokemon(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) loadPokemon();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse">SYNCHRONIZING POKEDEX DATA...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassPanel className="max-w-md w-full text-center py-12">
          <Target className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl font-black italic uppercase text-white mb-2">Signal Lost</h2>
          <p className="text-slate-400 mb-8">The requested Pokemon entry could not be located in the neural database.</p>
          <Link href="/pokedex">
            <NeonButton color="sky" className="w-full">Return to Pokedex</NeonButton>
          </Link>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <Link href="/pokedex" className="inline-flex items-center gap-2 text-slate-400 hover:text-sky-400 mb-8 transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Pokedex
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Visuals */}
        <div className="space-y-8">
          <GlassPanel className="relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden bg-slate-900/30 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_70%)]" />
            
            {/* 3D-like Aura */}
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-2/3 h-2/3 border border-sky-500/20 rounded-full blur-2xl"
            />

            {/* Cinematic Pokemon Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key={showShiny ? 'shiny' : 'normal'}
                initial={{ opacity: 0, scale: 0.8, rotateY: 30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                className="relative z-10 w-full h-full flex items-center justify-center p-8"
              >
                {/* Holographic Glow Base */}
                <div className="absolute w-64 h-64 bg-sky-500/20 rounded-full blur-[100px] animate-pulse" />
                
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={showShiny ? pokemon.shinyImage : pokemon.image}
                    alt={pokemon.name}
                    fill
                    priority
                    className="object-contain drop-shadow-[0_0_50px_rgba(56,189,248,0.5)] scale-110"
                  />
                </motion.div>
                
                {/* Scanning Lines Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />
              </motion.div>
            </AnimatePresence>

            <button 
              onClick={() => setShowShiny(!showShiny)}
              className={`absolute bottom-6 right-6 flex items-center gap-3 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-500 group/shiny ${
                showShiny 
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105 hover:scale-110' 
                  : 'bg-slate-900/80 border border-slate-700 text-slate-400 hover:border-sky-400 hover:text-sky-400 hover:bg-slate-900'
              }`}
            >
              <Sparkles 
                size={14} 
                className={showShiny ? 'animate-spin-slow' : 'group-hover/shiny:animate-pulse'} 
              />
              <span className="relative">
                {showShiny ? 'SHINY MODE ACTIVE' : 'NORMAL MODE'}
              </span>
              {showShiny && (
                <motion.div 
                  layoutId="shiny-glow"
                  className="absolute inset-0 rounded-full bg-white/20 animate-pulse"
                />
              )}
            </button>
          </GlassPanel>

          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="!p-4">
              <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-2">Primary Type</span>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xl ${TYPE_COLORS[pokemon.types[0]] || 'bg-sky-500/20 text-sky-400 border-sky-500/30'}`}>
                  {(() => {
                    const PrimaryIcon = TYPE_ICONS[pokemon.types[0].toLowerCase()] || Zap;
                    return <PrimaryIcon size={20} />;
                  })()}
                </div>
                <span className="text-xl font-bold capitalize">{pokemon.types[0]}</span>
              </div>
            </GlassPanel>
            {pokemon.types[1] && (
              <GlassPanel className="!p-4">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-2">Secondary Type</span>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xl ${TYPE_COLORS[pokemon.types[1]] || 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                    {(() => {
                      const SecondaryIcon = TYPE_ICONS[pokemon.types[1].toLowerCase()] || Shield;
                      return <SecondaryIcon size={20} />;
                    })()}
                  </div>
                  <span className="text-xl font-bold capitalize">{pokemon.types[1]}</span>
                </div>
              </GlassPanel>
            )}
          </div>

          {/* Weaknesses */}
          <GlassPanel className="!p-4 mt-4">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-3">Defensive Weaknesses</span>
            <div className="flex flex-wrap gap-2">
              {pokemon.weaknesses?.map((type) => {
                const Icon = TYPE_ICONS[type.toLowerCase()] || Sparkles;
                return (
                  <div 
                    key={type}
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 shadow-lg ${TYPE_COLORS[type.toLowerCase()] || 'bg-slate-800 text-slate-400 border-slate-700'}`}
                  >
                    <Icon size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{type}</span>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          {/* Physical Traits */}
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="!p-4 border-slate-800/50">
              <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">Height</span>
              <span className="text-2xl font-black italic">{pokemon.height}m</span>
            </GlassPanel>
            <GlassPanel className="!p-4 border-slate-800/50">
              <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">Weight</span>
              <span className="text-2xl font-black italic">{pokemon.weight}kg</span>
            </GlassPanel>
          </div>

          {/* Abilities */}
          <div className="space-y-3">
            <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block ml-1">Special Abilities</span>
            {pokemon.abilities.map((ability) => (
              <GlassPanel key={ability.name} className="!p-4 border-slate-800/50 group hover:border-sky-500/30 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-black uppercase italic tracking-tight group-hover:text-sky-400 transition-colors">
                    {ability.name.replace(/-/g, ' ')}
                  </span>
                  {ability.isHidden && (
                    <span className="text-[8px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 font-black uppercase">Hidden</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{ability.description}</p>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-baseline gap-4 mb-2">
              <h1 className="text-6xl font-black italic tracking-tighter neon-text uppercase">{pokemon.name}</h1>
              <span className="text-3xl font-black text-slate-700 italic">#{String(pokemon.dexNumber).padStart(3, '0')}</span>
            </div>
            <p className="text-xl text-slate-400 leading-relaxed italic">{pokemon.description}</p>
          </div>

          <RadarStatistics 
            stats={pokemon.stats} 
            type={pokemon.types[0]} 
            isLegendary={pokemon.training.baseExp >= 300} 
          />

            <div className="flex items-center gap-6">
              <NeonButton 
                className={`flex-1 h-14 transition-all ${isSimulating ? 'scale-95 opacity-80' : ''}`}
                color={showShiny ? "yellow" : "sky"}
                onClick={simulateEncounter}
              >
                {isSimulating ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin" size={18} />
                    <span>SCANNING NEURAL LINK...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className={showShiny ? "animate-pulse" : ""} />
                    <span>{showShiny ? `SHINY FOUND IN ${attempts}!` : `SCAN ENCOUNTER #${attempts + 1}`}</span>
                  </div>
                )}
              </NeonButton>
              <button 
                onClick={() => {
                  const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`);
                  audio.play();
                }}
                className={`w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-all group ${isSimulating ? 'animate-pulse' : ''}`}
                title="Play Pokemon Cry"
              >
                <Activity size={24} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Hunter's Intel */}
            <div className="grid grid-cols-2 gap-4">
              <GlassPanel className="!p-4 border-slate-800/50">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">EV Yield</span>
                <span className="text-sm font-bold text-sky-400 capitalize">{pokemon.training.evYield || 'None'}</span>
              </GlassPanel>
              <GlassPanel className="!p-4 border-slate-800/50">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">Catch Rate</span>
                <span className="text-xl font-black italic">{pokemon.training.catchRate}</span>
              </GlassPanel>
              <GlassPanel className="!p-4 border-slate-800/50">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">Base Exp</span>
                <span className="text-xl font-black italic">{pokemon.training.baseExp}</span>
              </GlassPanel>
              <GlassPanel className="!p-4 border-slate-800/50">
                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-1">Base Friendship</span>
                <span className="text-xl font-black italic">{pokemon.baseFriendship || 70}</span>
              </GlassPanel>
            </div>

            {/* Breeding & Gender */}
            <GlassPanel className="!p-6 border-slate-800/50">
              <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-4">Breeding & Gender</span>
              
              <div className="space-y-6">
                {/* Gender Ratio Bar */}
                <div>
                  {typeof pokemon.breeding.genderRatio !== 'string' && (
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 tracking-widest">
                      <span className="text-sky-400">Male</span>
                      <span className="text-rose-400">Female</span>
                    </div>
                  )}
                  
                  {typeof pokemon.breeding.genderRatio === 'string' ? (
                    <div className="group relative">
                      <div className="h-3 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden flex items-center justify-center">
                        <motion.div 
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/10 to-transparent"
                        />
                        <span className="relative z-10 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                          Genderless Biological Profile
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-2.5 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pokemon.breeding.genderRatio.male}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-sky-600 to-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]" 
                        />
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pokemon.breeding.genderRatio.female}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500">
                        <span className="text-sky-400/80">{pokemon.breeding.genderRatio.male}%</span>
                        <span className="text-rose-400/80">{pokemon.breeding.genderRatio.female}%</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-2">Egg Groups</span>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.breeding.eggGroups.map(group => (
                        <span key={group} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold uppercase capitalize">
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest font-black block mb-2">Hatch Time</span>
                    <span className="text-lg font-black italic text-white uppercase tracking-tighter">
                      ~{pokemon.breeding.hatchSteps} Steps
                    </span>
                  </div>
                </div>
              </div>
            </GlassPanel>
        </div>
      </div>

      {/* Evolution Tree Section - Now Full Width */}
      <div className="mt-16 relative group/evo">
        <GlassPanel className="!p-8 overflow-hidden">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-2 text-slate-500">
            <Zap className="text-sky-400" size={16} />
            Evolution Sequence
          </h3>
          
          {/* Navigation Buttons */}
          <button 
            onClick={() => scroll(evoScrollRef, 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-sky-400 flex items-center justify-center opacity-0 group-hover/evo:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll(evoScrollRef, 'right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-sky-400 flex items-center justify-center opacity-0 group-hover/evo:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={evoScrollRef}
            className="flex items-center gap-12 overflow-x-auto scrollbar-hide pb-12 pt-10 px-20 snap-x perspective-1000"
            style={{ perspective: '1200px' }}
          >
            {pokemon.evolutions.map((evo, idx) => (
              <div key={evo.id} className="flex items-center gap-12 snap-center">
                <Link href={`/pokemon/${evo.name}`}>
                  <motion.div 
                    initial={{ rotateY: 20, scale: 0.9, opacity: 0.8 }}
                    whileInView={{ rotateY: 0, scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotateY: 0, z: 100 }}
                    viewport={{ once: false, amount: 0.8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border transition-all w-72 min-h-[360px] shadow-2xl preserve-3d ${
                      evo.id === pokemon.id ? 'bg-sky-500/10 border-sky-400 shadow-[0_0_50px_rgba(56,189,248,0.4)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-48 h-48 relative">
                      <Image src={evo.image} alt={evo.name} fill className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                    </div>
                    <span className={`text-xl font-black uppercase tracking-tighter text-center ${
                      evo.id === pokemon.id ? 'text-sky-400' : 'text-slate-400'
                    }`}>
                      {evo.name}
                    </span>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {evo.types.map(t => (
                        <span key={t} className={`text-xs px-4 py-1.5 rounded-xl uppercase font-black border ${TYPE_COLORS[t] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </Link>
                {idx < pokemon.evolutions.length - 1 && (
                  <div className="text-slate-700">
                    {pokemon.evolutions[idx].stage < pokemon.evolutions[idx+1].stage ? (
                      <ChevronRight size={40} className="opacity-20" />
                    ) : (
                      <div className="w-12 h-px bg-slate-800/50" />
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Mega/GMAX Forms */}
            {pokemon.varieties && pokemon.varieties.length > 0 && (
              <div className="flex items-center gap-12 snap-center">
                <div className="text-slate-700">
                  <ChevronRight size={40} className="opacity-20" />
                </div>
                {pokemon.varieties.map((variety) => (
                  <Link key={variety.name} href={`/pokemon/${variety.slug}`}>
                    <motion.div 
                      initial={{ rotateY: -20, scale: 0.9, opacity: 0.8 }}
                      whileInView={{ rotateY: 0, scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.1, rotateY: 0, z: 100 }}
                      viewport={{ once: false, amount: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border bg-slate-900/40 border-slate-800/50 border-dashed hover:border-amber-400 cursor-pointer transition-all w-72 min-h-[360px] shadow-2xl preserve-3d"
                    >
                      {/* Fixed Mega Tag position to avoid clipping */}
                      <div className="absolute top-4 right-4 px-4 py-1.5 bg-amber-500 rounded-xl text-xs font-black text-slate-950 uppercase shadow-xl tracking-widest z-20">Mega</div>
                      <div className="w-48 h-48 relative">
                        <Image src={variety.image} alt={variety.name} fill className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" />
                      </div>
                      <span className="text-xl font-black uppercase tracking-tighter text-amber-400 text-center">
                        {variety.name.split(' ').pop()}
                      </span>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {variety.types.map(t => (
                          <span key={t} className={`text-xs px-4 py-1.5 rounded-xl uppercase font-black border ${TYPE_COLORS[t] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Breeding/Hunting Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassPanel className="border-l-4 border-l-sky-400">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-sky-400" />
            <h4 className="font-bold uppercase tracking-wider">Best Hotspot</h4>
          </div>
          <p className="text-sm text-slate-400">North Province Area Three (Paldea)</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full w-fit uppercase">
            High Density Area
          </div>
        </GlassPanel>

        <GlassPanel className="border-l-4 border-l-amber-400">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-amber-400" />
            <h4 className="font-bold uppercase tracking-wider">Shiny Method</h4>
          </div>
          <p className="text-sm text-slate-400">Mass Outbreak + Level 3 Sparkling Sandwich</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full w-fit uppercase">
            1 / 512 Odds
          </div>
        </GlassPanel>

        <GlassPanel className="border-l-4 border-l-indigo-400">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-indigo-400" />
            <h4 className="font-bold uppercase tracking-wider">Active Time</h4>
          </div>
          <p className="text-sm text-slate-400">Daytime / Clear Weather</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit uppercase">
            Environmental Match
          </div>
        </GlassPanel>
      </div>

      {/* TCG Cards Section */}
      {pokemon.tcgCards && pokemon.tcgCards.length > 0 && (
        <div className="mt-16 relative group/tcg">
          <h3 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-400/30">
              <Sparkles size={20} />
            </div>
            {pokemon.name} Trading Cards
          </h3>

          <button 
            onClick={() => scroll(tcgScrollRef, 'left')}
            className="absolute left-0 top-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-sky-400 flex items-center justify-center opacity-0 group-hover/tcg:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => scroll(tcgScrollRef, 'right')}
            className="absolute right-0 top-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 text-sky-400 flex items-center justify-center opacity-0 group-hover/tcg:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
          >
            <ChevronRight size={24} />
          </button>

          <div 
            ref={tcgScrollRef}
            className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x"
          >
            {pokemon.tcgCards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -15, scale: 1.05, rotate: 2 }}
                className="shrink-0 w-64 aspect-[2.5/3.5] relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl shadow-black/80 border border-slate-800 snap-start"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 p-6 flex flex-col justify-end">
                  <span className="text-xs font-black uppercase text-sky-400">{card.name}</span>
                </div>
                <Image 
                  src={card.image} 
                  alt={card.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, color }: { label: string, value: number, color: string }) {
  const percentage = Math.min((value / 255) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  );
}
