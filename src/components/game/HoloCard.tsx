'use client';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MonsterCard, Rarity } from '@/store/useGameStore';
import { getRarityColor, getRarityGlow, getRarityBorder, getRarityBadgeColor, TYPE_GRADIENT } from '@/services/gameData';
import { Star, Zap, Shield, Heart, Wind, Swords, Sparkles, Activity } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HoloCardProps {
  card: MonsterCard;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  isRevealing?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', ice: '❄️',
  fighting: '🥊', poison: '🧪', ground: '🏜️', flying: '💨', psychic: '🔮',
  bug: '🪲', rock: '🪨', ghost: '👻', dragon: '🐉', dark: '🌑',
  steel: '⚙️', fairy: '🧚', normal: '⚪'
};

const TYPE_THEMES: Record<string, { 
  primary: string, 
  secondary: string, 
  glow: string, 
  bg: string, 
  aura: string,
  particles: string 
}> = {
  fire:     { primary: '#ff4d00', secondary: '#ff9500', glow: 'shadow-orange-500/50', aura: 'bg-orange-500/20', bg: 'from-orange-950 via-red-900 to-slate-950', particles: '🔥' },
  water:    { primary: '#00d2ff', secondary: '#3a7bd5', glow: 'shadow-blue-500/50', aura: 'bg-blue-500/20', bg: 'from-blue-950 via-cyan-900 to-slate-950', particles: '💧' },
  electric: { primary: '#ffea00', secondary: '#f1c40f', glow: 'shadow-yellow-500/50', aura: 'bg-yellow-500/20', bg: 'from-yellow-950 via-amber-900 to-slate-950', particles: '⚡' },
  grass:    { primary: '#00ff87', secondary: '#60efff', glow: 'shadow-emerald-500/50', aura: 'bg-emerald-500/20', bg: 'from-emerald-950 via-green-900 to-slate-950', particles: '🌿' },
  psychic:  { primary: '#ff00cc', secondary: '#3333ff', glow: 'shadow-purple-500/50', aura: 'bg-purple-500/20', bg: 'from-purple-950 via-indigo-900 to-slate-950', particles: '🔮' },
  dragon:   { primary: '#00f2fe', secondary: '#4facfe', glow: 'shadow-cyan-500/50', aura: 'bg-cyan-500/20', bg: 'from-cyan-950 via-blue-900 to-slate-950', particles: '🐉' },
  dark:     { primary: '#434343', secondary: '#000000', glow: 'shadow-slate-500/50', aura: 'bg-slate-500/20', bg: 'from-slate-950 via-black to-slate-950', particles: '🌑' },
  ghost:    { primary: '#7303c0', secondary: '#03001e', glow: 'shadow-violet-500/50', aura: 'bg-violet-500/20', bg: 'from-violet-950 via-purple-900 to-black', particles: '👻' },
  poison:   { primary: '#a040a0', secondary: '#4a1a4a', glow: 'shadow-purple-500/50', aura: 'bg-purple-500/20', bg: 'from-purple-950 via-violet-900 to-slate-950', particles: '🧪' },
  flying:   { primary: '#87ceeb', secondary: '#4682b4', glow: 'shadow-sky-400/50', aura: 'bg-sky-400/20', bg: 'from-sky-900 via-blue-900 to-slate-950', particles: '💨' },
  bug:      { primary: '#a8b820', secondary: '#6d7815', glow: 'shadow-lime-500/50', aura: 'bg-lime-500/20', bg: 'from-lime-950 via-green-900 to-slate-950', particles: '🪲' },
  rock:     { primary: '#b8a038', secondary: '#786824', glow: 'shadow-yellow-700/50', aura: 'bg-yellow-700/20', bg: 'from-yellow-950 via-stone-900 to-slate-950', particles: '🪨' },
  steel:    { primary: '#b8b8d0', secondary: '#787890', glow: 'shadow-slate-400/50', aura: 'bg-slate-400/20', bg: 'from-slate-800 via-gray-900 to-slate-950', particles: '⚙️' },
  ice:      { primary: '#98d8d8', secondary: '#639090', glow: 'shadow-cyan-300/50', aura: 'bg-cyan-300/20', bg: 'from-cyan-900 via-blue-900 to-slate-950', particles: '❄️' },
  fairy:    { primary: '#ee99ac', secondary: '#9b6470', glow: 'shadow-pink-400/50', aura: 'bg-pink-400/20', bg: 'from-pink-900 via-rose-900 to-slate-950', particles: '🧚' },
  default:  { primary: '#38bdf8', secondary: '#1e293b', glow: 'shadow-sky-500/50', aura: 'bg-sky-500/20', bg: 'from-slate-900 via-slate-950 to-black', particles: '✨' },
};

export function HoloCard({ card, size = 'md', onClick, selected, showStats, isRevealing }: HoloCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse 3D Tilt Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 150, damping: 20 });
  
  // Holographic shine position
  const shineX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']), { stiffness: 150, damping: 20 });
  const shineY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const isMythic = card.rarity === 'Mythic';
  const isLegendary = card.rarity === 'Legendary';
  const isUltra = card.rarity === 'Ultra Rare';
  const isSuper = card.rarity === 'Super Rare';
  const isPremium = isMythic || isLegendary || isUltra;
  
  const theme = TYPE_THEMES[card.types[0]] || TYPE_THEMES.default;

  const cardSizes = {
    sm: 'w-48 h-64',
    md: 'w-64 h-[24rem]',
    lg: 'w-80 h-[30rem]',
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative cursor-pointer select-none ${cardSizes[size]} shrink-0 perspective-1000 group`}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`w-full h-full rounded-[2.5rem] border-4 ${getRarityBorder(card.rarity)} relative overflow-hidden bg-slate-950 shadow-2xl transition-all duration-500 
          ${isHovered ? theme.glow : getRarityGlow(card.rarity)}
          ${isMythic ? 'animate-pulse border-white/40' : ''}`}
      >
        {/* ── BACKGROUND LAYER ── */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} overflow-hidden`}>
          {/* Enhanced Animated Background for Premium Cards */}
          <motion.div 
            animate={isPremium ? { 
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180, 360]
            } : { opacity: 0.2 }}
            transition={{ duration: isMythic ? 8 : 15, repeat: Infinity, ease: "linear" }}
            className={`absolute -inset-1/2 ${theme.aura} blur-[100px] rounded-full`}
          />
          
          {/* Parallax Depth Background Elements - More dense for premium */}
          <motion.div 
            style={{ 
              x: useTransform(mouseX, [-0.5, 0.5], [20, -20]),
              y: useTransform(mouseY, [-0.5, 0.5], [20, -20]),
            }}
            className={`absolute inset-0 opacity-20 pointer-events-none ${!isPremium ? 'hidden' : ''}`}
          >
            <div className="absolute top-10 left-10 text-4xl">{theme.particles}</div>
            <div className="absolute bottom-20 right-10 text-4xl">{theme.particles}</div>
            <div className="absolute top-1/2 left-1/4 text-2xl">{theme.particles}</div>
          </motion.div>
        </div>

        {/* ── HOLOGRAPHIC SHEEN (SSR EFFECT) ── */}
        <motion.div 
          className={`absolute inset-0 pointer-events-none z-50 mix-blend-color-dodge transition-opacity duration-300
            ${isPremium ? 'opacity-30 group-hover:opacity-60' : 'opacity-0 group-hover:opacity-20'}`}
          style={{
            background: isMythic 
              ? `linear-gradient(${useTransform(mouseX, [-0.5, 0.5], [0, 720])}deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8f00ff)`
              : `radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.8) 0%, transparent 50%), linear-gradient(${useTransform(mouseX, [-0.5, 0.5], [0, 360])}deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)`,
            backgroundSize: isMythic ? '200% 200%' : 'auto',
          }}
        />

        {/* ── PREMIUM PARTICLE OVERLAY ── */}
        {isPremium && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
             {[...Array(isMythic ? 15 : 5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-20, 400],
                    opacity: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 30 : -30)]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                  className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                  style={{ left: `${(i / (isMythic ? 15 : 5)) * 100}%`, top: -20 }}
                />
             ))}
          </div>
        )}

        {/* ── CARD TOP ── */}
        <div className="absolute top-0 left-0 right-0 p-5 flex justify-between items-start z-30">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`px-4 py-1.5 rounded-full ${getRarityBadgeColor(card.rarity)} border border-white/20 backdrop-blur-md shadow-xl`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{card.rarity}</span>
          </motion.div>
          
          {/* Series Tag */}
          <div className="text-[8px] font-black text-white/40 uppercase tracking-widest text-right">
            Ver 2.5 / GEN {card.pokemonId < 152 ? '01' : card.pokemonId < 252 ? '02' : 'DX'}
            <br />
            ID #{String(card.pokemonId).padStart(4, '0')}
          </div>
        </div>

        {/* ── MONSTER ARTWORK (CENTER) ── */}
        <div className="absolute inset-0 flex items-center justify-center -mt-12 overflow-visible">
          {/* Aura Pulse */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`absolute w-64 h-64 rounded-full blur-[60px] ${theme.aura}`}
          />
          
          <motion.div
            style={{ 
              x: useTransform(mouseX, [-0.5, 0.5], [-30, 30]),
              y: useTransform(mouseY, [-0.5, 0.5], [-30, 30]),
              z: 100,
            }}
            className="relative z-20 pointer-events-none"
          >
            <motion.img
              src={card.artworkUrl}
              alt={card.displayName}
              className={`object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${
                size === 'sm' ? 'w-32 h-32' : size === 'md' ? 'w-56 h-56' : 'w-72 h-72'
              } ${card.isShiny ? 'brightness-110 contrast-125 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]' : ''}`}
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              onError={(e) => { (e.target as HTMLImageElement).src = card.sprite; }}
            />
            
            {/* Sparkles for Shiny */}
            {card.isShiny && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.4 
                    }}
                    className="absolute text-amber-300 text-xl"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                  >
                    ✦
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── CARD BOTTOM (INFO) ── */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-40">
          {/* Monster Name - MASSIVE TYPOGRAPHY */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 relative"
          >
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-lg [text-shadow:0_4px_12px_rgba(0,0,0,0.8)]">
              {card.displayName}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: card.stars }).map((_, i) => (
                <Star key={i} size={14} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              ))}
            </div>
          </motion.div>

          {/* CP Score */}
          <div className="absolute top-[-40px] right-6 text-right">
            <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Combat Power</div>
            <div className="text-4xl font-black italic text-white drop-shadow-xl flex items-baseline justify-end gap-1">
              <span className="text-sky-400 text-xl">CP</span>
              {card.cp.toLocaleString()}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <StatSegment label="ATK" value={card.attack} max={250} icon={<Swords size={12} />} color="bg-rose-500" />
            <StatSegment label="DEF" value={card.defense} max={250} icon={<Shield size={12} />} color="bg-sky-500" />
            <StatSegment label="HP" value={card.hp} max={300} icon={<Heart size={12} />} color="bg-emerald-500" />
            <StatSegment label="SPD" value={card.speed} max={200} icon={<Wind size={12} />} color="bg-amber-500" />
          </div>

          {/* Signature Move */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Signature Move</span>
              <span className="text-sm font-black italic uppercase tracking-tight text-amber-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                {card.specialMove}
              </span>
            </div>
            <div className="flex gap-1">
              {card.types.map(t => (
                <div 
                  key={t} 
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group/type relative" 
                  title={t}
                >
                  <span className="text-lg drop-shadow-md group-hover/type:scale-125 transition-transform">
                    {TYPE_ICONS[t] || '✨'}
                  </span>
                  {/* Subtle Glow behind icon */}
                  <div className={`absolute inset-0 rounded-xl opacity-20 blur-sm ${TYPE_THEMES[t]?.aura || 'bg-white/10'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BORDER PULSE (Legendary Only) ── */}
        {(isLegendary || isMythic) && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-0 border-[6px] ${isMythic ? 'border-pink-500/30' : 'border-amber-400/30'} pointer-events-none rounded-[2.5rem]`}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

function StatSegment({ label, value, max, icon, color }: { label: string, value: number, max: number, icon: any, color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col gap-1 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">{icon}</span>
          <span className="text-[9px] font-black text-white/60 uppercase">{label}</span>
        </div>
        <span className="text-[10px] font-black text-white tracking-tighter">{value}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full rounded-sm transition-all duration-1000 delay-${i * 100} ${
              i * 10 < pct ? color : 'bg-transparent'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
