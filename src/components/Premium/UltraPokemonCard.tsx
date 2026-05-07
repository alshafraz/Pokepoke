'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Shield, Activity } from 'lucide-react';

interface UltraPokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    image: string;
    shinyImage: string;
    types: string[];
    dexNumber: number;
  };
  isActive?: boolean;
}

const TYPE_CONFIG: Record<string, { color: string; aura: string; icon: any }> = {
  fire: { color: 'from-orange-600 to-red-600', aura: 'bg-orange-500/30', icon: Zap },
  water: { color: 'from-blue-600 to-cyan-600', aura: 'bg-blue-500/30', icon: Activity },
  grass: { color: 'from-emerald-600 to-green-600', aura: 'bg-emerald-500/30', icon: Shield },
  electric: { color: 'from-yellow-400 to-amber-500', aura: 'bg-yellow-400/30', icon: Zap },
  psychic: { color: 'from-pink-500 to-purple-600', aura: 'bg-pink-500/30', icon: Sparkles },
  dragon: { color: 'from-indigo-600 to-purple-700', aura: 'bg-indigo-600/30', icon: Shield },
  default: { color: 'from-slate-700 to-slate-900', aura: 'bg-sky-500/20', icon: Activity },
};

export default function UltraPokemonCard({ pokemon, isActive }: UltraPokemonCardProps) {
  const [isShiny, setIsShiny] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 300, damping: 30 });
  
  // Holo Shine Position
  const shineX = useSpring(useTransform(mouseX, [0, 400], [-50, 150]), { stiffness: 300, damping: 30 });
  const shineY = useSpring(useTransform(mouseY, [0, 600], [-50, 150]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const mainType = pokemon.types[0].toLowerCase();
  const config = TYPE_CONFIG[mainType] || TYPE_CONFIG.default;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className={`relative w-[320px] h-[480px] rounded-[2.5rem] p-1 transition-all duration-700 ${
        isActive ? 'scale-110 z-50' : 'scale-90 opacity-60 grayscale-[0.5]'
      }`}
    >
      {/* Border Glow */}
      <div className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${config.color} opacity-50 blur-xl animate-pulse`} />
      
      <div className="relative w-full h-full bg-slate-950 rounded-[2.4rem] overflow-hidden border border-white/10 flex flex-col">
        {/* Animated Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
        
        {/* Holographic Shine Layer */}
        <motion.div 
          style={{ 
            left: shineX,
            top: shineY,
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%)'
          }}
          className="absolute w-full h-full pointer-events-none z-20 mix-blend-overlay"
        />

        {/* Card Header */}
        <div className="p-6 flex justify-between items-start z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase mb-1">National Dex</span>
            <span className="text-2xl font-black italic text-white tracking-tighter">#{String(pokemon.dexNumber).padStart(3, '0')}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsShiny(!isShiny);
            }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isShiny ? 'bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            <Sparkles size={20} />
          </button>
        </div>

        {/* Main Artwork Area */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* Background Aura */}
          <motion.div 
            animate={{ 
              scale: isActive ? [1, 1.2, 1] : 1,
              opacity: isActive ? [0.3, 0.6, 0.3] : 0.2
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`absolute w-64 h-64 rounded-full blur-[80px] ${config.aura}`}
          />
          
          <motion.div
            style={{ translateZ: '50px' }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-56 h-56 z-10"
          >
            <Image
              src={isShiny ? pokemon.shinyImage : pokemon.image}
              alt={pokemon.name}
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            />
            {isShiny && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 pointer-events-none"
              >
                <Sparkles className="absolute top-0 right-0 text-amber-300" size={24} />
                <Sparkles className="absolute bottom-4 left-0 text-amber-200" size={16} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Card Footer */}
        <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/5 z-10">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 neon-text">{pokemon.name}</h3>
          <div className="flex gap-3">
            {pokemon.types.map((t) => (
              <div 
                key={t}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shine Sweep Animation */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30"
        />
      </div>
    </motion.div>
  );
}
