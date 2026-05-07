export type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' 
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'steel' | 'fairy' | 'dark';

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  slug: string;
  dexNumber: number;
  types: PokemonType[];
  image: string;
  shinyImage: string;
  generation: number;
  stats: PokemonStats;
  abilities: { name: string, description: string, isHidden: boolean }[];
  height: number;
  weight: number;
  training: {
    baseExp: number;
    catchRate: number;
    baseFriendship: number;
    evYield: string;
  };
  breeding: {
    eggGroups: string[];
    hatchSteps: number;
    genderRatio: string | { male: number, female: number };
  };
  description: string;
  evolutions: { name: string, id: number, image: string, types: PokemonType[], stage: number }[];
  tcgCards?: { id: string, name: string, image: string }[];
  varieties: { name: string, image: string, types: PokemonType[] }[];
  weaknesses?: PokemonType[];
}

export interface Game {
  id: string;
  name: string;
  region: string;
}

export interface SpawnLocation {
  id: string;
  pokemonId: number;
  gameId: string;
  mapName: string;
  areaName: string;
  biome: string;
  weather?: string;
  spawnRate: number;
  shinyOdds: string;
  coords: { x: number; y: number };
  timeOfDay: 'Day' | 'Night' | 'Any';
  method: string;
  notes?: string;
}

export interface SandwichRecipe {
  id: string;
  name: string;
  ingredients: string[];
  powers: {
    sparkling: number;
    encounter: number;
    title: number;
  };
  types: PokemonType[];
}
