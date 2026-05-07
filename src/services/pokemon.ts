import { Pokemon, PokemonType } from '@/types';
import { TYPE_CHART } from '@/constants/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const detailCache = new Map<string | number, Pokemon>();

export async function fetchPokemonList(limit = 151, offset = 0) {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  return data.results;
}

export async function fetchPokemonSimpleList(limit = 20, offset = 0): Promise<Pokemon[]> {
  const cacheKey = `list-${limit}-${offset}`;
  if (detailCache.has(cacheKey)) return (detailCache.get(cacheKey) as any);

  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  const results = await Promise.all(
    data.results.map(async (p: any) => {
      const res = await fetch(p.url);
      const d = await res.json();
      return {
        id: d.id,
        name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
        slug: d.name,
        dexNumber: d.id,
        types: d.types.map((t: any) => t.type.name as PokemonType),
        image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
        stats: {
          hp: d.stats[0].base_stat,
          attack: d.stats[1].base_stat,
          defense: d.stats[2].base_stat,
          specialAttack: d.stats[3].base_stat,
          specialDefense: d.stats[4].base_stat,
          speed: d.stats[5].base_stat,
        }
      } as Pokemon;
    })
  );

  detailCache.set(cacheKey, results);
  return results;
}

export async function fetchNewestPokemon(limit = 10): Promise<any[]> {
  const cacheKey = `newest-${limit}`;
  if (detailCache.has(cacheKey)) return (detailCache.get(cacheKey) as any);

  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=1000`);
  const data = await response.json();
  
  const results = await Promise.all(
    data.results.map(async (p: any) => {
      const res = await fetch(p.url);
      const d = await res.json();
      return {
        id: d.id,
        name: d.name.charAt(0).toUpperCase() + d.name.slice(1),
        image: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
        types: d.types.map((t: any) => t.type.name),
        dexNumber: d.id
      };
    })
  );

  detailCache.set(cacheKey, results);
  return results;
}

export async function fetchAllPokemonNames(): Promise<{ name: string, id: number }[]> {
  const cacheKey = 'all-names';
  if (detailCache.has(cacheKey)) return (detailCache.get(cacheKey) as any);

  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=2000`);
  const data = await response.json();
  
  const results = data.results.map((p: any) => ({
    name: p.name,
    id: parseInt(p.url.split('/').filter(Boolean).pop())
  }));

  detailCache.set(cacheKey, results);
  return results;
}

export async function fetchPokemonDetail(idOrName: string | number): Promise<Pokemon> {
  if (detailCache.has(idOrName)) {
    return detailCache.get(idOrName)!;
  }

  // Phase 1: Basic Data
  const pokemonRes = await fetch(`${POKEAPI_BASE}/pokemon/${idOrName}`);
  if (!pokemonRes.ok) throw new Error('Pokemon not found');
  const pokemonData = await pokemonRes.json();

  // Phase 1.5: Fetch Species using the correct species URL from pokemonData
  // This avoids 404s for Mega/GMAX forms which don't have their own species entries
  const speciesData = await fetch(pokemonData.species.url).then(r => r.json());

  // Phase 2: Heavy Tasks in Parallel
  const abilitiesPromise = Promise.all(
    pokemonData.abilities.map(async (a: any) => {
      const data = await fetch(a.ability.url).then(r => r.json());
      return {
        name: a.ability.name,
        description: data.effect_entries.find((e: any) => e.language.name === 'en')?.short_effect || 'No description available.',
        isHidden: a.is_hidden
      };
    })
  );

  const evolutionsPromise = (async () => {
    const evoData = await fetch(speciesData.evolution_chain.url).then(r => r.json());
    
    // Flatten the tree: all unique species in the chain with their stage
    const allSpecies: { name: string, url: string, stage: number }[] = [];
    const traverse = (node: any, stage = 0) => {
      allSpecies.push({ 
        name: node.species.name, 
        url: node.species.url,
        stage 
      });
      node.evolves_to.forEach((next: any) => traverse(next, stage + 1));
    };
    traverse(evoData.chain);

    return Promise.all(allSpecies.map(async (spec) => {
      const speciesId = spec.url.split('/').filter(Boolean).pop();
      // Fetch pokemon detail to get types for each evolution in the chain
      const pData = await fetch(`${POKEAPI_BASE}/pokemon/${spec.name}`).then(r => r.json());
      return {
        name: spec.name,
        id: parseInt(speciesId!),
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
        types: pData.types.map((t: any) => t.type.name as PokemonType),
        stage: spec.stage
      };
    }));
  })();

  const tcgCardsPromise = fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${speciesData.name.replace(/-/g, ' ')}*"&pageSize=8`)
    .then(r => r.json())
    .then(tcgData => (tcgData.data || []).map((card: any) => ({ id: card.id, name: card.name, image: card.images.small })))
    .catch(() => []);

  const varietiesPromise = Promise.all(
    speciesData.varieties
      .filter((v: any) => v.pokemon.name.includes('-mega') || v.pokemon.name.includes('-gmax'))
      .map(async (v: any) => {
        const vData = await fetch(v.pokemon.url).then(r => r.json());
        return {
          name: v.pokemon.name.replace(/-/g, ' ').toUpperCase(),
          slug: v.pokemon.name,
          image: vData.sprites.other['official-artwork'].front_default || vData.sprites.front_default,
          types: vData.types.map((t: any) => t.type.name as PokemonType)
        };
      })
  );

  // INSTANT Local Weakness Calculation (Saves multiple network requests)
  const weaknesses: PokemonType[] = (() => {
    const multipliers: Record<string, number> = {};
    pokemonData.types.forEach((t: any) => {
      const rel = TYPE_CHART[t.type.name];
      if (rel) {
        rel.double.forEach(type => multipliers[type] = (multipliers[type] || 1) * 2);
        rel.half.forEach(type => multipliers[type] = (multipliers[type] || 1) * 0.5);
        rel.zero.forEach(type => multipliers[type] = 0);
      }
    });
    return Object.entries(multipliers).filter(([_, v]) => v > 1).map(([t]) => t as PokemonType);
  })();

  const [abilities, evolutions, tcgCards, varieties] = await Promise.all([
    abilitiesPromise,
    evolutionsPromise,
    tcgCardsPromise,
    varietiesPromise
  ]);

  const result: Pokemon = {
    id: pokemonData.id,
    name: pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1),
    slug: pokemonData.name,
    dexNumber: pokemonData.id,
    types: pokemonData.types.map((t: any) => t.type.name as PokemonType),
    image: pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.other.home.front_default || pokemonData.sprites.front_default,
    shinyImage: pokemonData.sprites.other['official-artwork'].front_shiny || pokemonData.sprites.other.home.front_shiny || pokemonData.sprites.front_shiny,
    generation: parseInt(speciesData.generation.url.split('/').filter(Boolean).pop() || '1'),
    stats: {
      hp: pokemonData.stats[0].base_stat,
      attack: pokemonData.stats[1].base_stat,
      defense: pokemonData.stats[2].base_stat,
      specialAttack: pokemonData.stats[3].base_stat,
      specialDefense: pokemonData.stats[4].base_stat,
      speed: pokemonData.stats[5].base_stat,
    },
    description: speciesData.flavor_text_entries.find((entry: any) => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || '',
    height: pokemonData.height / 10,
    weight: pokemonData.weight / 10,
    abilities,
    training: {
      baseExp: pokemonData.base_experience,
      catchRate: speciesData.capture_rate,
      baseFriendship: speciesData.base_happiness,
      evYield: pokemonData.stats.filter((s: any) => s.effort > 0).map((s: any) => `${s.effort} ${s.stat.name.replace(/-/g, ' ')}`).join(', ')
    },
    breeding: {
      eggGroups: speciesData.egg_groups.map((g: any) => g.name),
      hatchSteps: (speciesData.hatch_counter + 1) * 255,
      genderRatio: speciesData.gender_rate === -1 ? 'Genderless' : { male: (8 - speciesData.gender_rate) * 12.5, female: speciesData.gender_rate * 12.5 }
    },
    evolutions,
    tcgCards,
    varieties,
    weaknesses
  };

  detailCache.set(pokemonData.id, result);
  detailCache.set(pokemonData.name, result);
  
  return result;
}
