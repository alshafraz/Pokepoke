'use client';

import { useState, useEffect } from 'react';
import UltraPokemonCarousel from '@/components/Premium/UltraPokemonCarousel';
import { fetchPokemonDetail } from '@/services/pokemon';
import { Loader2 } from 'lucide-react';

const SHOWCASE_POKEMON = [
  'charizard',
  'mewtwo',
  'rayquaza',
  'lucario',
  'greninja',
  'garchomp',
  'arceus',
  'dialga',
  'palkia',
  'giratina-origin'
];

export default function ShowcasePage() {
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await Promise.all(
          SHOWCASE_POKEMON.map(name => fetchPokemonDetail(name))
        );
        setPokemonList(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Loader2 className="text-sky-500 animate-spin" size={60} />
        <h2 className="text-sky-500 font-black tracking-[0.5em] uppercase text-xs animate-pulse">
          Initializing Neural Link...
        </h2>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <UltraPokemonCarousel pokemonList={pokemonList} />
    </main>
  );
}
