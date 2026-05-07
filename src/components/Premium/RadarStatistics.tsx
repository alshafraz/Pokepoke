'use client';

import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, Target, Sparkles, Swords } from 'lucide-react';
import { TYPE_COLORS } from '@/constants/pokemon';
import { GlassPanel } from '../UI';

interface RadarStatisticsProps {
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  type: string;
  isLegendary?: boolean;
}

const ROLE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  tank: { icon: Shield, color: 'text-amber-400', label: 'Heavy Tank' },
  glass_cannon: { icon: Swords, color: 'text-rose-500', label: 'Glass Cannon' },
  speedster: { icon: Zap, color: 'text-sky-400', label: 'Speedster' },
  balanced: { icon: Activity, color: 'text-emerald-400', label: 'Tactical Balanced' },
  specialist: { icon: Target, color: 'text-indigo-400', label: 'Special Attacker' },
};

const COLOR_HEX: Record<string, string> = {
  fire: '#ea580c',
  water: '#2563eb',
  grass: '#059669',
  electric: '#eab308',
  psychic: '#db2777',
  ice: '#22d3ee',
  dragon: '#4338ca',
  dark: '#6366f1',
  fairy: '#fb7185',
  normal: '#94a3b8',
  fighting: '#b91c1c',
  flying: '#38bdf8',
  poison: '#9333ea',
  ground: '#b45309',
  rock: '#a16207',
  bug: '#65a30d',
  ghost: '#8b5cf6',
  steel: '#94a3b8',
};

export default function RadarStatistics({ stats, type, isLegendary }: RadarStatisticsProps) {
  const data = useMemo(() => [
    { subject: 'HP', A: stats.hp, fullMark: 255 },
    { subject: 'ATK', A: stats.attack, fullMark: 255 },
    { subject: 'DEF', A: stats.defense, fullMark: 255 },
    { subject: 'SPD', A: stats.speed, fullMark: 255 },
    { subject: 'S.DEF', A: stats.specialDefense, fullMark: 255 },
    { subject: 'S.ATK', A: stats.specialAttack, fullMark: 255 },
  ], [stats]);

  const role = useMemo(() => {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (stats.hp > 110 && stats.defense > 100) return ROLE_CONFIG.tank;
    if (stats.speed > 110 && stats.attack > 100) return ROLE_CONFIG.speedster;
    if (stats.attack > 120 && stats.defense < 70) return ROLE_CONFIG.glass_cannon;
    if (stats.specialAttack > 120) return ROLE_CONFIG.specialist;
    return ROLE_CONFIG.balanced;
  }, [stats]);

  const mainType = type.toLowerCase();
  const mainColor = TYPE_COLORS[mainType]?.split(' ')[0].replace('bg-', '') || 'sky-500';
  const colorHex = COLOR_HEX[mainType] || '#38bdf8';

  return (
    <GlassPanel className="relative overflow-hidden group border-white/5 bg-slate-950/40">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Dynamic Aura Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${mainColor}/20 rounded-full blur-[100px] animate-pulse`} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        {/* Radar Chart Area */}
        <div className="w-full h-[300px] md:w-[350px] relative">
          {/* Rotating Ambient Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 border border-${mainColor}/20 rounded-full scale-90 border-dashed`}
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 border border-${mainColor}/10 rounded-full scale-75 border-dotted`}
          />

          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid strokeOpacity={1} stroke="var(--radar-grid)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'var(--radar-label)', fontSize: 10, fontWeight: 900 }}
              />
              <Radar
                name="Stats"
                dataKey="A"
                stroke={colorHex}
                strokeWidth={3}
                fill={colorHex}
                fillOpacity={0.4}
                animationBegin={0}
                animationDuration={1500}
                isAnimationActive={true}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Scanning Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-x-0 h-0.5 bg-${mainColor}/30 blur-sm pointer-events-none`}
          />
        </div>

        {/* Info Panel */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] text-slate-500 uppercase block mb-1">
              Tactical Analysis
            </span>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${role.color}`}>
                <role.icon size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {role.label}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Class Identification Complete
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Total Power */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Power</span>
              <span className="text-xl font-black italic text-white">
                {Object.values(stats).reduce((a, b) => a + b, 0)}
              </span>
            </div>

            {/* Tier */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Tier</span>
              <span className={`text-lg font-black italic uppercase tracking-tight shrink-0 ${isLegendary ? 'text-amber-400 neon-text' : 'text-sky-400'}`}>
                {isLegendary ? 'LEGENDARY' : 'ELITE'}
              </span>
              {isLegendary && (
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-12 pointer-events-none"
                />
              )}
            </div>
          </div>

          {/* Quick Stats Bar (Mini) */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
              <span>Performance Capacity</span>
              <span>{(Object.values(stats).reduce((a, b) => a + b, 0) / 7.8).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(Object.values(stats).reduce((a, b) => a + b, 0) / 780) * 100}%` }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className={`h-full bg-gradient-to-r ${TYPE_COLORS[type.toLowerCase()]?.split(' ')[0].replace('bg-', 'from-').replace(' ', ' to-')} shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Corner Accents */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-${mainColor}/40 rounded-tl-xl`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-${mainColor}/40 rounded-br-xl`} />
    </GlassPanel>
  );
}
