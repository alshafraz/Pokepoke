'use client';

import { motion } from 'framer-motion';
import { NeonButton, GlassPanel } from '@/components/UI';
import { Sparkles, Map, Shield, Target, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { fetchNewestPokemon } from '@/services/pokemon';
import Image from 'next/image';

const TYPE_COLORS: Record<string, string> = {
  fire: 'bg-orange-600 text-white border-orange-400',
  water: 'bg-blue-600 text-white border-blue-400',
  grass: 'bg-emerald-600 text-white border-emerald-400',
  electric: 'bg-yellow-500 text-slate-950 border-yellow-300',
  psychic: 'bg-pink-600 text-white border-pink-400',
  ice: 'bg-cyan-400 text-slate-950 border-cyan-200',
  dragon: 'bg-indigo-700 text-white border-indigo-500',
  dark: 'bg-slate-800 text-white border-slate-600',
  fairy: 'bg-rose-400 text-white border-rose-200',
  normal: 'bg-slate-400 text-slate-950 border-slate-300',
  fighting: 'bg-red-700 text-white border-red-500',
  flying: 'bg-sky-400 text-slate-950 border-sky-200',
  poison: 'bg-purple-600 text-white border-purple-400',
  ground: 'bg-amber-700 text-white border-amber-500',
  rock: 'bg-yellow-800 text-white border-yellow-600',
  bug: 'bg-lime-600 text-white border-lime-400',
  ghost: 'bg-violet-800 text-white border-violet-600',
  steel: 'bg-slate-500 text-white border-slate-300',
};

export default function Home() {
  const [newest, setNewest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNewestPokemon(10);
        setNewest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center justify-start overflow-hidden px-6 pt-20">
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mb-24"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-sky-400 text-xs font-black tracking-[0.2em] mb-8"
        >
          <Sparkles size={14} className="animate-pulse" />
          ULTIMATE SHINY HUNTING COMPANION
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-none">
          HUNT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 neon-text">UNTHINKABLE</span>
        </h1>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The next generation of shiny hunting is here. Real-time maps, advanced odds calculators, and community hotspots for Paldea, Hisui, and beyond.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/shiny-hunter">
              <NeonButton className="h-14 px-10 group relative">
                <span className="relative z-10">Start Tracking</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full blur-md" />
              </NeonButton>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/maps">
              <button className="h-14 px-10 rounded-full font-black text-xs tracking-[0.2em] uppercase border border-slate-800 bg-slate-950/50 backdrop-blur-md hover:border-sky-500/50 hover:text-sky-400 transition-all flex items-center gap-3 group">
                <Map size={18} className="group-hover:rotate-12 transition-transform" />
                Explore Maps
              </button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Newest Pokemon Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-7xl relative z-10 mb-32"
      >
        <div className="flex items-center justify-between mb-10 px-4">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <span className="text-sky-400">#</span> NEW DISCOVERIES
            </h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Latest Generation Additions</p>
          </div>
          <Link href="/pokedex" className="text-sky-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="text-sky-400 animate-spin" size={40} />
          </div>
        ) : (
          <div className="relative group/newest">
            {/* Navigation Buttons */}
            <button 
              onClick={() => {
                const el = document.getElementById('newest-scroll');
                el?.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-800 text-sky-400 flex items-center justify-center opacity-0 group-hover/newest:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('newest-scroll');
                el?.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-slate-900/80 border border-slate-800 text-sky-400 flex items-center justify-center opacity-0 group-hover/newest:opacity-100 transition-opacity hover:bg-sky-500 hover:text-slate-950"
            >
              <ChevronRight size={24} />
            </button>

            <div 
              id="newest-scroll"
              className="flex gap-12 overflow-x-auto pb-20 pt-10 px-20 scrollbar-hide snap-x perspective-1000 mask-fade"
              style={{ perspective: '1200px' }}
            >
              {newest.map((p, i) => (
                <Link key={p.id} href={`/pokemon/${p.name.toLowerCase()}`} className="snap-center">
                  <motion.div
                    initial={{ rotateY: 25, scale: 0.9, opacity: 0.8 }}
                    whileInView={{ rotateY: 0, scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotateY: 0, z: 100 }}
                    viewport={{ once: false, amount: 0.6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="shrink-0 w-72 p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 hover:border-sky-500 transition-all group relative overflow-hidden shadow-2xl preserve-3d"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                      <span className="text-7xl font-black italic tracking-tighter">#{p.id}</span>
                    </div>
                    <div className="relative w-48 h-48 mx-auto mb-8">
                      <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-3xl group-hover:bg-sky-500/20 transition-all" />
                      <Image src={p.image} alt={p.name} fill className="object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] scale-110" />
                    </div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4">{p.name}</h3>
                    <div className="flex gap-2">
                      {p.types.map((t: string) => (
                        <span key={t} className={`text-xs px-4 py-1.5 rounded-full uppercase font-black border ${TYPE_COLORS[t] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 w-full max-w-6xl pb-20"
      >
        <FeatureCard 
          icon={<Target className="text-sky-400" />}
          title="Live Spawns"
          description="Exact coordinates for outbreaks and rare spawns in Scarlet & Violet."
        />
        <FeatureCard 
          icon={<Shield className="text-amber-400" />}
          title="Method Master"
          description="Optimized sandwich recipes and hunting routes for maximum efficiency."
        />
        <FeatureCard 
          icon={<Sparkles className="text-indigo-400" />}
          title="Shiny Odds"
          description="Advanced simulator accounting for Charm, Sandwiches, and Outbreaks."
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <GlassPanel className="group hover:border-sky-500/50 transition-all duration-500">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-500/10 transition-all duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </GlassPanel>
  );
}
