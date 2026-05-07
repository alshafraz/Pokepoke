'use client';

import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";

export function ThemeManager() {
  const isTwilight = useAppStore((state) => state.isTwilight);

  useEffect(() => {
    if (isTwilight) {
      document.documentElement.classList.add('twilight-mode');
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('twilight-mode');
      document.documentElement.classList.add('dark');
    }
  }, [isTwilight]);

  // Random Encounter Event
  useEffect(() => {
    const triggerEncounter = () => {
      const rarePokemon = ["Miraidon", "Koraidon", "Ogerpon", "Terapagos"];
      const pokemon = rarePokemon[Math.floor(Math.random() * rarePokemon.length)];
      
      toast.custom((t) => (
        <div 
          onClick={() => {
            toast.dismiss(t.id);
            window.location.href = `/pokemon/${pokemon.toLowerCase()}`;
          }}
          className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full glass-panel !bg-sky-500/10 border-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)] pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer hover:!bg-sky-500/20 transition-all group`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <Sparkles className="h-10 w-10 text-sky-400 animate-pulse group-hover:scale-125 transition-transform" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-sky-400 uppercase italic tracking-tighter">
                  Rare Signal Detected!
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  A wild <span className="text-slate-100 font-bold">{pokemon}</span> has appeared in your sector!
                </p>
                <p className="mt-2 text-[8px] font-black text-sky-500/50 uppercase tracking-[0.2em] group-hover:text-sky-400">
                  Click to intercept signal
                </p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 8000 });
    };

    const timer = setTimeout(triggerEncounter, 20000); 
    return () => clearTimeout(timer);
  }, []);

  return null;
}
