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

  // Actions
  setMode: (mode: GameStore['currentMode']) => void;
  selectCard: (card: MonsterCard) => void;
  addToCollection: (card: MonsterCard) => void;
  startBattle: (player: MonsterCard, enemy: MonsterCard) => void;
  attackEnemy: () => void;
  resetBattle: () => void;
  summonCard: (card: MonsterCard) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
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
};

export const useGameStore = create<GameStore>((set, get) => ({
  playerName: 'Trainer',
  level: 1,
  xp: 0,
  coins: 500,
  collection: [],
  selectedCard: null,
  battle: initialBattle,
  currentMode: 'menu',
  isSummoning: false,
  lastSummon: null,

  setMode: (mode) => set({ currentMode: mode }),

  selectCard: (card) => set({ selectedCard: card }),

  addToCollection: (card) =>
    set((s) => ({ collection: [...s.collection, card] })),

  startBattle: (player, enemy) =>
    set({
      battle: {
        ...initialBattle,
        phase: 'battling',
        playerCard: player,
        enemyCard: enemy,
        playerHp: player.hp,
        enemyHp: enemy.hp,
      },
    }),

  attackEnemy: () => {
    const { battle } = get();
    if (!battle.playerCard || !battle.enemyCard) return;

    const isCritical = Math.random() < 0.2;
    const baseAtk = battle.playerCard.attack;
    const baseDef = battle.enemyCard.defense;
    const rawDmg = Math.max(5, baseAtk - baseDef * 0.5);
    const dmg = Math.round(rawDmg * (isCritical ? 1.75 : 1) * (0.85 + Math.random() * 0.3));
    const newCombo = isCritical ? battle.combo + 1 : 0;
    const newEnemyHp = Math.max(0, battle.enemyHp - dmg);

    // Enemy counter-attack
    const enemyDmg = Math.round(
      Math.max(3, battle.enemyCard.attack * 0.6 - battle.playerCard.defense * 0.3) *
        (0.8 + Math.random() * 0.4)
    );
    const newPlayerHp = Math.max(0, battle.playerHp - enemyDmg);
    const newPhase =
      newEnemyHp <= 0 ? 'capture' : newPlayerHp <= 0 ? 'defeat' : 'battling';

    const logEntry = isCritical
      ? `⚡ CRITICAL HIT! ${dmg} damage! Enemy counter for ${enemyDmg}!`
      : `⚔️ ${dmg} damage dealt! Enemy counter for ${enemyDmg}!`;

    set((s) => ({
      battle: {
        ...s.battle,
        phase: newPhase,
        enemyHp: newEnemyHp,
        playerHp: newPlayerHp,
        turn: s.battle.turn + 1,
        log: [logEntry, ...s.battle.log.slice(0, 4)],
        lastDamage: dmg,
        combo: newCombo,
        isCritical,
      },
    }));
  },

  resetBattle: () => set({ battle: initialBattle }),

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
