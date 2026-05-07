import { Game, SpawnLocation } from '@/types';

export const GAMES: Game[] = [
  { id: 'sv', name: 'Pokemon Scarlet & Violet', region: 'Paldea' },
  { id: 'pla', name: 'Pokemon Legends: Arceus', region: 'Hisui' },
  { id: 'za', name: 'Pokemon Legends: Z-A', region: 'Lumiose City' },
];

export const MOCK_SPAWNS: SpawnLocation[] = [
  {
    id: '1',
    pokemonId: 921, // Pawmi
    gameId: 'sv',
    mapName: 'Paldea',
    areaName: 'South Province Area One',
    biome: 'Grassland',
    spawnRate: 40,
    shinyOdds: '1/4096',
    coords: { x: 42.36, y: -71.05 },
    timeOfDay: 'Day',
    method: 'Wild Encounter',
  },
  {
    id: '2',
    pokemonId: 1001, // Wo-Chien
    gameId: 'sv',
    mapName: 'Paldea',
    areaName: 'South Province Area One',
    biome: 'Shrine',
    spawnRate: 100,
    shinyOdds: 'Locked',
    coords: { x: 42.35, y: -71.06 },
    timeOfDay: 'Any',
    method: 'Static Encounter',
  }
];
