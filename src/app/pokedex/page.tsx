'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pokemon } from '@/types';
import { fetchPokemonSimpleList } from '@/services/pokemon';
import { PokemonCard } from '@/components/PokemonCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { TYPE_COLORS } from '@/constants/pokemon';

const ITEMS_PER_PAGE = 20;

export default function PokedexPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { searchQuery, selectedTypes, toggleSelectedType, clearFilters } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prev => prev + ITEMS_PER_PAGE);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const newItems = await fetchPokemonSimpleList(ITEMS_PER_PAGE, offset);
      if (newItems.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
      setPokemon(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...newItems.filter(p => !existingIds.has(p.id))];
      });
    } catch (error) {
      console.error('Failed to load pokemon:', error);
    } finally {
      setLoading(false);
    }
  }, [offset, loading, hasMore]);

  useEffect(() => {
    loadMore();
  }, [offset]);

  const filteredPokemon = pokemon.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.dexNumber).includes(searchQuery);
    const matchesTypes = selectedTypes.length === 0 || selectedTypes.every(t => p.types.includes(t as any));
    return matchesSearch && matchesTypes;
  });

  // Fix: Auto-load more if filtered results are too few but more exist in API
  useEffect(() => {
    if (!loading && hasMore && filteredPokemon.length < 10) {
      const timer = setTimeout(() => {
        setOffset(prev => prev + ITEMS_PER_PAGE);
      }, 500); // Small delay to prevent infinite rapid firing
      return () => clearTimeout(timer);
    }
  }, [filteredPokemon.length, loading, hasMore]);

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter neon-text mb-2 uppercase">National Dex</h1>
          <p className="text-slate-400">Search and explore the ultimate shiny hunting database.</p>
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all flex items-center gap-2 group ${
              showFilters || selectedTypes.length > 0 
                ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-400'
            }`}
          >
            <Filter size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
              {selectedTypes.length === 0 ? 'Tactical Filter' : `Active Filters: ${selectedTypes.length}`}
            </span>
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 p-6 glass-panel z-50 w-[320px] md:w-[450px] shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Dual-Type Selection</span>
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.keys(TYPE_COLORS).map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleSelectedType(type as any)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        selectedTypes.includes(type as any)
                          ? 'bg-sky-500 text-slate-950 border-sky-400 scale-105 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {selectedTypes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    {selectedTypes.map(t => (
                      <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/30 font-black uppercase">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {filteredPokemon.map((p, idx) => (
          <motion.div
            key={p.id}
            ref={idx === filteredPokemon.length - 1 ? lastElementRef : null}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <PokemonCard pokemon={p} />
          </motion.div>
        ))}
      </motion.div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-sky-400" size={40} />
          <p className="text-slate-500 font-medium animate-pulse">Syncing more Data...</p>
        </div>
      )}
      
      {!hasMore && (
        <div className="py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
          End of National Dex Reached
        </div>
      )}
    </div>
  );
}
