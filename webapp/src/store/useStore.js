import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Favorites
      favorites: [],
      addToFavorites: (experience) => set((state) => ({
        favorites: [...state.favorites, experience]
      })),
      removeFromFavorites: (id) => set((state) => ({
        favorites: state.favorites.filter(f => f.id !== id)
      })),
      isFavorite: (id) => get().favorites.some(f => f.id === id),

      // Search
      searchQuery: '',
      selectedCategory: 'all',
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'locallink-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        favorites: state.favorites,
      }),
    }
  )
);

export default useStore;
