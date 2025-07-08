import { create } from 'zustand'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthStore>(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: user => set({ user, isAuthenticated: !!user }),
  setLoading: loading => set({ isLoading: loading }),
  signOut: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}))
