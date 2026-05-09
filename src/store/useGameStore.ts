import { create } from 'zustand';

export type Rarity = 'Common' | 'Rare' | 'Super Rare' | 'Ultra Rare' | 'Legendary' | 'Mythic';

export interface MonsterCard {
  id: string;
  pokemonId: number;
  name: string;
  displayName: string;
  types: string[];
  rarity: Rarity;
  stars: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  cp: number;
  specialMove: string;
  specialSkill: string;
  isShiny: boolean;
  sprite: string;
  artworkUrl: string;
  capturedAt?: number;
}

export interface BattleState {
  phase: 'idle' | 'selecting' | 'battling' | 'victory' | 'defeat' | 'capture';
  playerCard: MonsterCard | null;
  enemyCard: MonsterCard | null;
  playerHp: number;
  enemyHp: number;
  turn: number;
  log: string[];
  lastDamage: number | null;
  combo: number;
  isCritical: boolean;
  playerEnergy: number;
  enemyEnergy: number;
  isDefending: boolean;
}

export interface GameStore {
  // Player data
  playerName: string;
  level: number;
  xp: number;
  coins: number;

  // Collection
  collection: MonsterCard[];
  selectedCard: MonsterCard | null;

  // Battle
  battle: BattleState;

  // Game Mode
  currentMode: 'menu' | 'arcade' | 'collection' | 'summon' | 'battle';

  // Summon
  isSummoning: boolean;
  lastSummon: MonsterCard | null;

  // Arcade Session
  arcadeSession: {
    rounds: number;
    maxRounds: number;
    wins: number;
    enemies: MonsterCard[];
    captureTarget: MonsterCard | null;
    collectionHp: Record<string, number>; // cardId -> currentHp
    results: { pokemonId: string; status: 'captured' | 'escaped' | 'skipped' | 'won' | 'lost' }[];
  };

  // Actions
  setMode: (mode: GameStore['currentMode']) => void;
  selectCard: (card: MonsterCard) => void;
  addToCollection: (card: MonsterCard) => void;
  startBattle: (player: MonsterCard, enemy: MonsterCard) => void;
  performAction: (type: 'attack' | 'defend' | 'special' | 'signature') => void;
  resetBattle: () => void;
  summonCard: (card: MonsterCard) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  startArcadeSession: () => void;
  endArcadeSession: () => void;
  recordRoundResult: (result: { pokemonId: string; status: 'captured' | 'escaped' | 'skipped' | 'won' | 'lost' }, enemy?: MonsterCard) => void;
}

const initialBattle: BattleState = {
  phase: 'idle',
  playerCard: null,
  enemyCard: null,
  playerHp: 100,
  enemyHp: 100,
  turn: 0,
  log: [],
  lastDamage: null,
  combo: 0,
  isCritical: false,
  playerEnergy: 0,
  enemyEnergy: 0,
  isDefending: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  playerName: 'Trainer',
  level: 1,
  xp: 0,
  coins: 100000,
  collection: [],
  selectedCard: null,
  battle: initialBattle,
  currentMode: 'menu',
  isSummoning: false,
  lastSummon: null,
  arcadeSession: {
    rounds: 0,
    maxRounds: 3,
    wins: 0,
    enemies: [],
    captureTarget: null,
    collectionHp: {},
    results: [],
  },

  setMode: (mode) => set({ currentMode: mode }),

  selectCard: (card) => set({ selectedCard: card }),

  addToCollection: (card) =>
    set((s) => ({ collection: [...s.collection, card] })),

  startBattle: (player, enemy) => set((s) => {
    // Persistent HP check
    const persistentHp = s.arcadeSession.collectionHp[player.id];
    const playerHp = persistentHp !== undefined ? persistentHp : player.hp;

    return {
      battle: {
        ...initialBattle,
        phase: 'battling',
        playerCard: player,
        enemyCard: enemy,
        playerHp: playerHp,
        enemyHp: enemy.hp,
      },
    };
  }),

  performAction: (type) => {
    const { battle, arcadeSession } = get();
    if (!battle.playerCard || !battle.enemyCard) return;

    let dmg = 0;
    let energyCost = 0;
    let logEntry = '';
    let isCritical = Math.random() < 0.2;
    let isDefending = false;

    // Define multipliers and costs
    const skillConfig = {
      attack: { dmgMult: 1.0, energyReq: 0, energyGain: 20 },
      defend: { dmgMult: 0, energyReq: 0, energyGain: 10 },
      special: { dmgMult: 1.6, energyReq: 40, energyGain: 0 },
      signature: { dmgMult: 2.5, energyReq: 80, energyGain: 0 },
    };

    const config = skillConfig[type];

    // Check Energy
    if (battle.playerEnergy < config.energyReq) {
      set((s) => ({
        battle: { ...s.battle, log: [`⚠️ Not enough energy for ${type}!`, ...s.battle.log.slice(0, 4)] }
      }));
      return;
    }

    if (type === 'defend') {
      isDefending = true;
      logEntry = `🛡️ ${battle.playerCard.displayName} is taking a defensive stance!`;
    } else {
      const baseAtk = battle.playerCard.attack;
      const baseDef = battle.enemyCard.defense;
      const rawDmg = Math.max(5, baseAtk * config.dmgMult - baseDef * 0.4);
      dmg = Math.round(rawDmg * (isCritical ? 1.75 : 1) * (0.85 + Math.random() * 0.3));
      
      const moveName = type === 'attack' ? 'Basic Attack' : type === 'special' ? battle.playerCard.specialSkill : battle.playerCard.specialMove;
      logEntry = isCritical 
        ? `💥 CRITICAL! ${moveName} dealt ${dmg} damage!` 
        : `⚔️ ${moveName} dealt ${dmg} damage!`;
    }

    const newEnemyHp = Math.max(0, battle.enemyHp - dmg);
    const newPlayerEnergy = Math.min(100, battle.playerEnergy - config.energyReq + config.energyGain);

    // Enemy Turn Logic (Simple AI)
    let enemyDmg = 0;
    let enemyLog = '';
    const canEnemySpecial = battle.enemyEnergy >= 40;
    const enemyAction = canEnemySpecial && Math.random() > 0.6 ? 'special' : 'attack';
    
    const enemyBaseAtk = battle.enemyCard.attack;
    const enemyBaseDef = battle.playerCard.defense;
    const enemyRawDmg = Math.max(3, enemyBaseAtk * (enemyAction === 'special' ? 1.5 : 1) - enemyBaseDef * (isDefending ? 0.8 : 0.3));
    enemyDmg = Math.round(enemyRawDmg * (0.8 + Math.random() * 0.4));
    
    const newPlayerHp = Math.max(0, battle.playerHp - enemyDmg);
    const newEnemyEnergy = Math.min(100, battle.enemyEnergy + (enemyAction === 'special' ? -40 : 20));
    
    enemyLog = enemyAction === 'special' 
      ? `🌪️ Enemy used ${battle.enemyCard.specialSkill} for ${enemyDmg}!`
      : `🥊 Enemy countered for ${enemyDmg}!`;

    // Persist HP to session
    const newCollectionHp = {
      ...arcadeSession.collectionHp,
      [battle.playerCard.id]: newPlayerHp
    };

    const newPhase = newEnemyHp <= 0 ? 'victory' : newPlayerHp <= 0 ? 'defeat' : 'battling';

    set((s) => ({
      arcadeSession: { ...s.arcadeSession, collectionHp: newCollectionHp },
      battle: {
        ...s.battle,
        phase: newPhase,
        enemyHp: newEnemyHp,
        playerHp: newPlayerHp,
        playerEnergy: newPlayerEnergy,
        enemyEnergy: newEnemyEnergy,
        turn: s.battle.turn + 1,
        log: [enemyLog, logEntry, ...s.battle.log.slice(0, 3)],
        lastDamage: dmg,
        isCritical,
        isDefending,
      },
    }));
  },

  resetBattle: () => set({ battle: initialBattle }),

  startArcadeSession: () => set({
    arcadeSession: { rounds: 0, maxRounds: 3, wins: 0, enemies: [], results: [], captureTarget: null, collectionHp: {} }
  }),

  endArcadeSession: () => set({
    arcadeSession: { rounds: 0, maxRounds: 3, wins: 0, enemies: [], results: [], captureTarget: null, collectionHp: {} },
    currentMode: 'menu'
  }),

  recordRoundResult: (result, enemy) => set((s) => {
    const newRounds = s.arcadeSession.rounds + 1;
    const newWins = result.status === 'won' ? s.arcadeSession.wins + 1 : s.arcadeSession.wins;
    const newEnemies = enemy ? [...s.arcadeSession.enemies, enemy] : s.arcadeSession.enemies;
    
    let captureTarget = null;
    if (newRounds >= s.arcadeSession.maxRounds && newWins >= 2 && newEnemies.length > 0) {
      captureTarget = newEnemies[Math.floor(Math.random() * newEnemies.length)];
    }

    return {
      arcadeSession: {
        ...s.arcadeSession,
        rounds: newRounds,
        wins: newWins,
        enemies: newEnemies,
        results: [...s.arcadeSession.results, result],
        captureTarget
      }
    };
  }),

  summonCard: (card) =>
    set((s) => ({
      isSummoning: false,
      lastSummon: card,
      collection: [...s.collection, card],
    })),

  addCoins: (amount) => set((s) => ({ coins: s.coins + amount })),

  spendCoins: (amount) => {
    const { coins } = get();
    if (coins < amount) return false;
    set((s) => ({ coins: s.coins - amount }));
    return true;
  },

  addXp: (amount) => {
    const { xp, level } = get();
    const newXp = xp + amount;
    const xpRequired = level * 100;
    if (newXp >= xpRequired) {
      set((s) => ({ level: s.level + 1, xp: newXp - xpRequired }));
    } else {
      set({ xp: newXp });
    }
  },
}));
