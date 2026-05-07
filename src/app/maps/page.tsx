'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { GlassPanel } from '@/components/UI';
import { Map as MapIcon, Layers, Target, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-900 animate-pulse rounded-3xl flex items-center justify-center text-slate-500 font-bold italic tracking-widest uppercase">INITIALIZING SATELLITE LINK...</div>
});

import { WeatherOverlay } from '@/components/Maps/WeatherOverlay';
import { LiveSignals } from '@/components/Maps/LiveSignals';
import { Activity, Radio, Wind, ShieldCheck } from 'lucide-react';

export default function MapsPage() {
  const [selectedRegion, setSelectedRegion] = useState<'Paldea' | 'Hisui' | 'Lumiose'>('Paldea');
  const [weather, setWeather] = useState<'Clear' | 'Rain' | 'Snow' | 'Sand'>('Clear');
  const [isHolographic, setIsHolographic] = useState(false);

  const regionData = {
    Paldea: {
      game: 'Scarlet & Violet',
      map: '/maps/paldea.png',
      color: 'rose',
      weather: 'Rain',
      sectors: [
        { name: "Casseroya Lake", intel: "High density of Water types. Frequent Dondozo outbreaks." },
        { name: "Asado Desert", intel: "Primary zone for Ground/Rock types. High visibility." },
        { name: "Glaseado Mountain", intel: "Extreme cold. Best for Ice types and Frigibax line." },
        { name: "Area Zero", intel: "UNSTABLE: Paradox signatures detected. Caution advised." }
      ]
    },
    Hisui: {
      game: 'Legends: Arceus',
      map: '/maps/hisui.png',
      color: 'indigo',
      weather: 'Snow',
      sectors: [
        { name: "Obsidian Fieldlands", intel: "Starting zone. High Alpha presence in late-game." },
        { name: "Crimson Mirelands", intel: "Muddy terrain. Home to Ursaluna and rare Spiritomb." },
        { name: "Cobalt Coastlands", intel: "Coastal zone. Massive Mass Outbreaks frequent." },
        { name: "Alabaster Icelands", intel: "Final frontier. Home to Hisuian Braviary." }
      ]
    },
    Lumiose: {
      game: 'Legends: Z-A',
      map: '/maps/lumiose.png',
      color: 'emerald',
      weather: 'Clear',
      sectors: [
        { name: "Central Plaza", intel: "Core urban sector. Projected main hub for PLZA." },
        { name: "Autumnal Avenue", intel: "Projected high-density commerce zone." },
        { name: "Urban Reconstruction", intel: "Under development. New spawns expected." }
      ]
    }
  };

  useEffect(() => {
    setWeather(regionData[selectedRegion].weather as any || 'Clear');
  }, [selectedRegion]);

  const currentRegion = regionData[selectedRegion];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/5 pb-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-${currentRegion.color}-500/10 border border-${currentRegion.color}-400/30 text-${currentRegion.color}-400`}>
              {currentRegion.game} Strategic Atlas
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantum Mapping Online</span>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter neon-text mb-4 uppercase">Global Intelligence Atlas</h1>
          <p className="text-slate-400 leading-relaxed max-w-xl">
            Real-time geospatial surveillance of the Pokémon world. Integrated with <span className="text-white font-bold">Holographic Scan Technology</span> and live agent feedback.
          </p>
        </div>

        <div className="flex flex-col gap-4 items-end">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            {(['Paldea', 'Hisui', 'Lumiose'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedRegion === region 
                    ? `bg-${regionData[region].color}-500 text-slate-950 shadow-[0_0_20px_rgba(var(--color-${regionData[region].color}),0.4)]` 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
          <div 
            onClick={() => setIsHolographic(!isHolographic)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isHolographic ? 'text-sky-400' : 'text-slate-600'}`}>Holographic Mode</div>
            <div className={`w-8 h-4 rounded-full border border-white/10 relative ${isHolographic ? 'bg-sky-500/20' : 'bg-slate-900'}`}>
              <motion.div animate={{ x: isHolographic ? 18 : 2 }} className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Global News Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
            <Radio size={12} className="animate-pulse" /> Live Intel Stream
          </div>
          
          <div className="space-y-3">
            <IntelItem agent="AGENT_RED" message="Massive cluster of shiny Gible detected in Asado Desert." time="2m ago" />
            <IntelItem agent="AGENT_CYAN" message="Weather shift detected in Glaseado Mountain. Ice spawns increased." time="5m ago" />
            <IntelItem agent="SYSTEM_BOT" message="Lumiose City redevelopment plan updated. New sector accessible." time="12m ago" />
            <IntelItem agent="AGENT_GOLD" message="Shiny Charizard signal intercepted near Area Zero." time="15m ago" />
          </div>

          <GlassPanel className="bg-sky-500/5 border-sky-400/20">
            <h4 className="text-[10px] font-black uppercase text-sky-400 tracking-widest mb-4">Tactical Status</h4>
            <div className="space-y-4">
              <StatusBadge icon={<Wind size={12} />} label="Weather" value={weather} />
              <StatusBadge icon={<Activity size={12} />} label="Agent Activity" value="High" />
              <StatusBadge icon={<ShieldCheck size={12} />} label="Link Stability" value="100%" />
            </div>
          </GlassPanel>
        </div>

        {/* Map Viewer with Holographic Effect */}
        <div className="lg:col-span-9 relative">
          <div className={`transition-all duration-1000 ${isHolographic ? '[perspective:2000px]' : ''}`}>
            <motion.div
              animate={{ 
                rotateX: isHolographic ? 15 : 0,
                rotateY: isHolographic ? -5 : 0,
                scale: isHolographic ? 0.95 : 1
              }}
              className="relative glass-panel !p-0 overflow-hidden rounded-[40px] border-slate-800 h-[750px] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              {/* Scanline Effect */}
              <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-sky-400/30 z-30 shadow-[0_0_20px_rgba(56,189,248,0.5)] pointer-events-none"
              />

              {/* Dynamic Components */}
              <WeatherOverlay type={weather} />
              <LiveSignals />

              <img 
                src={currentRegion.map} 
                className={`w-full h-full object-cover transition-all duration-[3000ms] ${isHolographic ? 'opacity-40 blur-[1px] brightness-125 saturate-150' : 'opacity-80'}`} 
                alt={selectedRegion}
              />

              {/* Grid Overlay for Holographic Feel */}
              {isHolographic && (
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-20" />
              )}
              
              {/* HUD Overlays */}
              <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] shadow-2xl">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Quantized Sector Scan</div>
                    <div className={`text-4xl font-black italic text-${currentRegion.color}-400 uppercase tracking-tighter`}>
                      {selectedRegion} ATLAS
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-6 py-3 bg-slate-950/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Satellite Link: STABLE</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div className="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-6 rounded-[32px] w-80 shadow-2xl">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Environment Telemetry</div>
                    <div className="space-y-3">
                      <TelemetryRow label="Barometric Pressure" value="1013.2 hPa" />
                      <TelemetryRow label="Wind Velocity" value="14.2 km/h" />
                      <TelemetryRow label="Signal Strength" value="-42 dBm" />
                    </div>
                  </div>
                  <div className="bg-slate-950/60 backdrop-blur-xl border border-white/5 px-8 py-5 rounded-full flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-black text-white">A{i}</div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">128 Hunters Active</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reflection Effect Below Map */}
            {isHolographic && (
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-sky-500/20 blur-[100px] pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelItem({ agent, message, time }: { agent: string, message: string, time: string }) {
  return (
    <GlassPanel className="!p-5 bg-slate-950/40 border-white/5 hover:bg-slate-900/60 transition-all group">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">{agent}</span>
        <span className="text-[10px] text-slate-500 font-bold uppercase">{time}</span>
      </div>
      <p className="text-xs text-slate-300 group-hover:text-white transition-colors leading-relaxed font-medium">{message}</p>
    </GlassPanel>
  );
}

function StatusBadge({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-slate-400">
        {icon}
        <span className="text-xs font-black uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xs font-black text-white uppercase">{value}</span>
    </div>
  );
}

function TelemetryRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-mono text-emerald-400">{value}</span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-black text-emerald-400 uppercase">{value}</span>
    </div>
  );
}

function HUDButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-white/5 p-3 rounded-xl flex items-center gap-2 text-slate-400 pointer-events-auto cursor-pointer hover:bg-slate-900 transition-all">
      {icon}
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function LayerToggle({ label, active }: { label: string, active: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className={`text-xs font-bold transition-colors ${active ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
      <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-sky-500/20 border border-sky-500/50' : 'bg-slate-800 border border-slate-700'}`}>
        <motion.div 
          animate={{ x: active ? 20 : 4 }}
          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${active ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-slate-600'}`} 
        />
      </div>
    </label>
  );
}
