"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface FavoritesStore {
  favorites: string[]
  toggleFavorite: (productId: string) => void
  clearFavorites: () => void
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        })),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "favorites-storage",
    },
  ),
)
