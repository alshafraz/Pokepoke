'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Shield, User, Zap, Eye, EyeOff, ExternalLink, Star, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { fetchAllPokemonNames } from '@/services/pokemon';

const navItems = [
  { name: 'Pokedex', href: '/pokedex', icon: Zap },
  { name: 'Maps', href: '/maps', icon: Map },
  { name: 'Shiny Hunter', href: '/shiny-hunter', icon: Shield },
  { name: 'Mezastar', href: '/mezastar', icon: User },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { searchQuery, setSearchQuery, toggleTheme, isTwilight, clearFilters } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [allPokemon, setAllPokemon] = useState<{name: string, id: number}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchAllPokemonNames().then(setAllPokemon);

    // Close suggestions when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = allPokemon
    .filter(p => p.name.includes(searchQuery.toLowerCase()))
    .slice(0, 8);

  const activeTwilight = mounted ? isTwilight : false;

  const handleSuggestionClick = (name: string) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    router.push(`/pokemon/${name}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel !py-3 !px-8 rounded-full">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />
          <span className="font-black text-xl tracking-tighter neon-text italic">
            SHINYDEX<span className="text-sky-400">HUNTER</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => {
                if (item.href === '/pokedex') clearFilters();
              }}
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-sky-400 ${
                pathname === item.href ? 'text-sky-400' : 'text-slate-400'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            suppressHydrationWarning
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTwilight ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400'
            }`}
            title={activeTwilight ? "Switch to Deep Dark" : "Switch to Twilight Stealth"}
          >
            {activeTwilight ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          
          <div ref={searchRef} className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400" size={16} />
            <input 
              type="text" 
              placeholder="Quick Search..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              suppressHydrationWarning
              className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 transition-all w-48 focus:w-64"
            />

            <AnimatePresence>
              {showSuggestions && searchQuery.length > 1 && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 p-2 glass-panel shadow-2xl z-[100] min-w-[280px]"
                >
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-2 mb-1 border-b border-white/5">
                    Suggested Targets
                  </div>
                  {suggestions.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSuggestionClick(p.name)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-500/10 cursor-pointer group/item transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} 
                          alt={p.name} 
                          className="w-8 h-8 object-contain drop-shadow-md"
                        />
                        <span className="text-sm font-bold text-slate-300 group-hover/item:text-sky-400 capitalize">
                          {p.name.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-slate-600 group-hover/item:text-sky-400 opacity-0 group-hover/item:opacity-100 transition-all" />
                    </div>
                  ))}
                  <Link 
                    href="/pokedex" 
                    onClick={() => setShowSuggestions(false)}
                    className="block p-3 mt-1 text-center text-[10px] font-black uppercase text-slate-500 hover:text-sky-400 transition-colors border-t border-white/5"
                  >
                    View All in National Dex
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/mezastar">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 cursor-pointer hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all"
              title="Mezastar"
            >
              <Star size={18} />
            </motion.div>
          </Link>
          <Link href="/shiny-hunter">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 h-9 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 cursor-pointer hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
              title="Open Shiny Hunter"
            >
              <Sparkles size={14} />
              Quick Hunt
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
};
