import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pokemon, PokemonType } from '@/types';

interface AppState {
  favorites: number[];
  recentlyViewed: number[];
  toggleFavorite: (id: number) => void;
  addRecentlyViewed: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: PokemonType[];
  toggleSelectedType: (type: PokemonType) => void;
  clearFilters: () => void;
  isTwilight: boolean;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      favorites: [],
      recentlyViewed: [],
      searchQuery: '',
      selectedTypes: [],
      isTwilight: false,
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((favId) => favId !== id)
            : [...state.favorites, id],
        })),
      addRecentlyViewed: (id) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((rvId) => rvId !== id);
          return {
            recentlyViewed: [id, ...filtered].slice(0, 10),
          };
        }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleSelectedType: (type) => set((state) => ({
        selectedTypes: state.selectedTypes.includes(type)
          ? state.selectedTypes.filter(t => t !== type)
          : [...state.selectedTypes, type]
      })),
      clearFilters: () => set({ selectedTypes: [], searchQuery: '' }),
      toggleTheme: () => set((state) => ({ isTwilight: !state.isTwilight })),
    }),
    {
      name: 'shinydex-storage',
      partialize: (state) => ({ 
        favorites: state.favorites, 
        recentlyViewed: state.recentlyViewed,
        isTwilight: state.isTwilight,
        selectedTypes: state.selectedTypes
      }),
    }
  )
);
