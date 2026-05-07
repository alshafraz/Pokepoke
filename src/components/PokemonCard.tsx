'use client';

import { motion } from 'framer-motion';
import { Pokemon } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TYPE_COLORS, TYPE_ICONS } from '@/constants/pokemon';

export const PokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  const mainType = pokemon.types[0].toLowerCase();
  const Icon = TYPE_ICONS[mainType] || Sparkles;

  return (
    <Link href={`/pokemon/${pokemon.name.toLowerCase()}`}>
      <motion.div
        whileHover={{ y: -10 }}
        className="relative group cursor-pointer"
      >
        <div className={`absolute inset-0 rounded-3xl blur-xl group-hover:opacity-40 opacity-0 transition-opacity duration-500 bg-gradient-to-br ${TYPE_COLORS[mainType]?.split(' ')[0] || 'from-sky-500/10 to-indigo-500/10'}`} />
        
        <div className="relative glass-panel !p-0 overflow-hidden rounded-3xl border-slate-800/50 hover:border-sky-400/50 transition-colors duration-500">
          <div className="relative h-48 w-full p-6 flex items-center justify-center bg-slate-900/50">
            <div className="absolute top-4 right-4 text-slate-700 font-black text-4xl opacity-20">
              #{String(pokemon.dexNumber).padStart(3, '0')}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative z-10 w-32 h-32"
            >
              <Image
                src={pokemon.image}
                alt={pokemon.name}
                fill
                className="object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              />
            </motion.div>
          </div>

          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold italic uppercase tracking-tighter neon-text">{pokemon.name}</h3>
                <div className="flex gap-2 mt-2">
                  {pokemon.types.map((type) => {
                    const t = type.toLowerCase();
                    const TypeIcon = TYPE_ICONS[t] || Sparkles;
                    return (
                      <span 
                        key={type} 
                        className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-lg border flex items-center gap-1.5 shadow-lg ${TYPE_COLORS[t] || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                      >
                        <TypeIcon size={10} />
                        {type}
                      </span>
                    );
                  })}
                </div>
              </div>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`${TYPE_COLORS[mainType]?.includes('text-white') ? 'text-sky-400' : 'text-amber-500'}`}
              >
                <Icon size={20} />
              </motion.div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="text-xs text-slate-500 font-medium">VIEW DETAILS</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-sky-400 group-hover:text-slate-950 transition-colors">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
