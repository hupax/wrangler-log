import { create } from 'zustand'
import { GitHubConfig } from '../lib/github'

interface GitHubStore {
  githubConfig: GitHubConfig | null
  isGitHubConnected: boolean

  // Actions
  setGitHubConfig: (config: GitHubConfig | null) => void
  setGitHubConnected: (connected: boolean) => void
  clearGitHubData: () => void
}

export const useGitHubStore = create<GitHubStore>(set => ({
  githubConfig: null,
  isGitHubConnected: false,

  setGitHubConfig: config => set({ githubConfig: config }),
  setGitHubConnected: connected => set({ isGitHubConnected: connected }),
  clearGitHubData: () =>
    set({
      githubConfig: null,
      isGitHubConnected: false,
    }),
}))
