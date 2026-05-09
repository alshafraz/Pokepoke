import { MonsterCard, Rarity } from '@/store/useGameStore';

export interface PokeballType {
  id: string;
  name: string;
  catchMultiplier: number;
  rarity: 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare' | 'Legendary';
  color: string;
  glow: string;
  sprite: string;
}

export const POKEBALLS: PokeballType[] = [
  { id: 'pokeball', name: 'Poké Ball', catchMultiplier: 1.0, rarity: 'Common', color: 'from-red-500 to-red-700', glow: 'shadow-red-500/50', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' },
  { id: 'greatball', name: 'Great Ball', catchMultiplier: 1.5, rarity: 'Rare', color: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/50', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png' },
  { id: 'ultraball', name: 'Ultra Ball', catchMultiplier: 2.0, rarity: 'Super Rare', color: 'from-yellow-400 to-amber-600', glow: 'shadow-yellow-500/50', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png' },
  { id: 'luxuryball', name: 'Luxury Ball', catchMultiplier: 2.5, rarity: 'Ultra Rare', color: 'from-slate-700 to-slate-900', glow: 'shadow-slate-400/50', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png' },
  { id: 'masterball', name: 'Master Ball', catchMultiplier: 10.0, rarity: 'Legendary', color: 'from-purple-500 via-pink-500 to-indigo-600', glow: 'shadow-purple-500/80', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png' },
];

export const CAPTURE_RATES: Record<Rarity, number> = {
  Common: 0.8,
  Rare: 0.6,
  'Super Rare': 0.4,
  'Ultra Rare': 0.2,
  Legendary: 0.1,
  Mythic: 0.05,
};

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';


// ── BALANCED RARITY CONFIG (Higher HP to prolong battles) ──
const RARITY_CONFIG: Record<Rarity, { stars: number; weight: number; hpBonus: number; atkBonus: number }> = {
  Common:       { stars: 1, weight: 50, hpBonus: 1.5, atkBonus: 0.8 }, // Reduced ATK, boosted HP
  Rare:         { stars: 2, weight: 25, hpBonus: 2.2, atkBonus: 1.0 },
  'Super Rare': { stars: 3, weight: 12, hpBonus: 3.5, atkBonus: 1.2 },
  'Ultra Rare': { stars: 4, weight: 8,  hpBonus: 5.0, atkBonus: 1.5 },
  Legendary:    { stars: 5, weight: 4,  hpBonus: 7.5, atkBonus: 2.0 },
  Mythic:       { stars: 6, weight: 1,  hpBonus: 10.0, atkBonus: 2.5 },
};

const SPECIAL_MOVES: Record<string, string[]> = {
  fire:    ['Inferno Burst', 'Magma Storm', 'Blaze Cannon'],
  water:   ['Tidal Crash', 'Hydro Surge', 'Whirlpool Strike'],
  grass:   ['Nature Wrath', 'Petal Storm', 'Vine Barrage'],
  electric:['Thunder King', 'Volt Crash', 'Static Surge'],
  psychic: ['Mind Shatter', 'Psychic Rift', 'Neural Blast'],
  ice:     ['Blizzard Fury', 'Frozen Lance', 'Arctic Blast'],
  dragon:  ['Dragon Omega', 'Scale Storm', 'Hyper Fang'],
  dark:    ['Shadow Doom', 'Night Slash X', 'Dark Pulse EX'],
  fairy:   ['Moonbeam Strike', 'Dazzle Gleam', 'Misty Surge'],
  default: ['Power Crush', 'Mega Impact', 'Final Drive'],
};

function pickRarity(): Rarity {
  const rarities = Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG[Rarity]][];
  const totalWeight = rarities.reduce((s, [, v]) => s + v.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const [rarity, config] of rarities) {
    roll -= config.weight;
    if (roll <= 0) return rarity;
  }
  return 'Common';
}

export async function fetchRandomMonster(forceRarity?: Rarity): Promise<MonsterCard> {
  const targetRarity = forceRarity ?? pickRarity();
  let data: any = null;
  let speciesData: any = null;
  let bst = 0;
  let attempts = 0;

  while (attempts < 10) {
    const id = Math.floor(Math.random() * 905) + 1;
    const res = await fetch(`${POKEAPI_BASE}/pokemon/${id}`);
    data = await res.json();
    bst = data.stats.reduce((acc: number, s: any) => acc + s.base_stat, 0);
    const speciesRes = await fetch(data.species.url);
    speciesData = await speciesRes.json();
    const isSpecial = speciesData.is_legendary || speciesData.is_mythical;
    const isHighTier = targetRarity === 'Legendary' || targetRarity === 'Mythic' || targetRarity === 'Ultra Rare';
    const isLowTier = targetRarity === 'Common' || targetRarity === 'Rare';
    if (isHighTier && (bst >= 500 || isSpecial)) break;
    if (isLowTier && bst < 500 && !isSpecial) break;
    if (targetRarity === 'Super Rare' && bst >= 400 && bst < 550) break;
    attempts++;
  }

  const rarity = targetRarity;
  const config = RARITY_CONFIG[rarity];
  const isShiny = Math.random() < 0.05 || rarity === 'Mythic';
  const types: string[] = data.types.map((t: any) => t.type.name);
  const primaryType = types[0] || 'default';
  
  // Fetch real moves from PokeAPI
  const apiMoves = data.moves
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((m: any) => m.move.name.charAt(0).toUpperCase() + m.move.name.slice(1).replace(/-/g, ' '));
    
  const typeMoves = SPECIAL_MOVES[primaryType] || SPECIAL_MOVES.default;
  const specialMove = typeMoves[Math.floor(Math.random() * typeMoves.length)];
  const specialSkill = apiMoves[0] || 'Quick Attack';

  const baseHp = data.stats.find((s: any) => s.stat.name === 'hp')?.base_stat ?? 60;
  const baseAtk = data.stats.find((s: any) => s.stat.name === 'attack')?.base_stat ?? 50;
  const baseDef = data.stats.find((s: any) => s.stat.name === 'defense')?.base_stat ?? 50;
  const baseSpd = data.stats.find((s: any) => s.stat.name === 'speed')?.base_stat ?? 50;

  const hp = Math.round(baseHp * config.hpBonus);
  const attack = Math.round(baseAtk * config.atkBonus);
  const defense = Math.round(baseDef * (config.hpBonus * 0.8)); // Def also scales with HP bonus to stay relevant
  const speed = baseSpd;
  
  // Calculate CP (Combat Power)
  const cp = Math.round((hp + attack + defense + speed) * 0.4);

  return {
    id: `${data.id}-${Date.now()}`,
    pokemonId: data.id,
    name: data.name,
    displayName: data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/-/g, ' '),
    types,
    rarity,
    stars: config.stars,
    hp,
    attack,
    defense,
    speed,
    cp,
    specialMove,
    specialSkill,
    isShiny,
    sprite: isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
    artworkUrl: isShiny
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${data.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
    capturedAt: Date.now(),
  };
}

export function getRarityColor(rarity: Rarity): string {
  return {
    Common:       'from-slate-400 to-slate-600',
    Rare:         'from-blue-400 to-blue-700',
    'Super Rare': 'from-violet-400 to-violet-700',
    'Ultra Rare': 'from-rose-400 to-orange-500',
    Legendary:    'from-amber-300 to-yellow-600',
    Mythic:       'from-pink-400 via-purple-500 to-cyan-400',
  }[rarity];
}

export function getRarityGlow(rarity: Rarity): string {
  return {
    Common:       'shadow-slate-400/30',
    Rare:         'shadow-blue-400/50',
    'Super Rare': 'shadow-violet-500/60',
    'Ultra Rare': 'shadow-rose-500/70',
    Legendary:    'shadow-amber-400/80',
    Mythic:       'shadow-pink-500/90',
  }[rarity];
}

export function getRarityBorder(rarity: Rarity): string {
  return {
    Common:       'border-slate-500/40',
    Rare:         'border-blue-400/50',
    'Super Rare': 'border-violet-500/60',
    'Ultra Rare': 'border-rose-500/70',
    Legendary:    'border-amber-400/80',
    Mythic:       'border-transparent',
  }[rarity];
}

export function getRarityBadgeColor(rarity: Rarity): string {
  return {
    Common:       'bg-slate-700 text-slate-300',
    Rare:         'bg-blue-900/80 text-blue-300',
    'Super Rare': 'bg-violet-900/80 text-violet-300',
    'Ultra Rare': 'bg-rose-900/80 text-rose-300',
    Legendary:    'bg-amber-900/80 text-amber-300',
    Mythic:       'bg-gradient-to-r from-pink-900/80 to-purple-900/80 text-pink-200',
  }[rarity];
}

export const TYPE_GRADIENT: Record<string, string> = {
  fire:     'from-orange-600/40 via-red-800/20 to-transparent',
  water:    'from-blue-600/40 via-cyan-800/20 to-transparent',
  grass:    'from-green-600/40 via-emerald-800/20 to-transparent',
  electric: 'from-yellow-500/40 via-amber-700/20 to-transparent',
  psychic:  'from-pink-600/40 via-rose-800/20 to-transparent',
  ice:      'from-cyan-400/40 via-blue-700/20 to-transparent',
  dragon:   'from-indigo-600/40 via-violet-800/20 to-transparent',
  dark:     'from-slate-700/60 via-gray-900/30 to-transparent',
  fairy:    'from-pink-400/40 via-rose-600/20 to-transparent',
  fighting: 'from-red-700/40 via-orange-900/20 to-transparent',
  ghost:    'from-violet-700/40 via-purple-900/20 to-transparent',
  steel:    'from-slate-400/40 via-gray-600/20 to-transparent',
  rock:     'from-yellow-800/40 via-amber-900/20 to-transparent',
  ground:   'from-amber-600/40 via-yellow-900/20 to-transparent',
  bug:      'from-lime-600/40 via-green-800/20 to-transparent',
  poison:   'from-purple-600/40 via-violet-800/20 to-transparent',
  flying:   'from-sky-500/40 via-blue-700/20 to-transparent',
  normal:   'from-slate-500/40 via-gray-700/20 to-transparent',
};
