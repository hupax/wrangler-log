import { useState, useCallback } from 'react'
import {
  useGitHubStore,
  GitHubConfig,
  ConnectionResult,
  RepoInfo,
  ImportResult,
} from '@/stores/github'
import { useAuthStore } from '@/stores/auth'

interface UseGitHubConnectionReturn {
  config: GitHubConfig
  setConfig: (config: GitHubConfig) => void
  isLoading: boolean
  testResult: (ConnectionResult & { message: string }) | null
  repoInfo: RepoInfo | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export function useGitHubConnection(): UseGitHubConnectionReturn {
  const { user } = useAuthStore()
  const {
    githubConfig,
    isGitHubConnected,
    isConnecting,
    connectionResult,
    repoInfo,
    testConnection,
    disconnect: storeDisconnect,
  } = useGitHubStore()

  const [config, setConfig] = useState<GitHubConfig>({
    accessToken: githubConfig?.accessToken || '',
    repoOwner: githubConfig?.repoOwner || '',
    repoName: githubConfig?.repoName || '',
    defaultBranch: githubConfig?.defaultBranch || 'main',
    basePath: githubConfig?.basePath || '',
  })

  const connect = useCallback(async () => {
    if (!user?.uid) return
    await testConnection(config, user.uid)
  }, [config, testConnection, user?.uid])

  const disconnect = useCallback(async () => {
    if (!user?.uid) return
    await storeDisconnect(user.uid)
  }, [storeDisconnect, user?.uid])

  return {
    config,
    setConfig,
    isLoading: isConnecting,
    testResult: connectionResult,
    repoInfo,
    connect,
    disconnect,
  }
}

interface UseGitHubImportReturn {
  isImporting: boolean
  importResult: ImportResult | null
  importNotes: () => Promise<void>
}

export function useGitHubImport(): UseGitHubImportReturn {
  const { user } = useAuthStore()
  const {
    isImporting,
    importResult,
    importNotes: storeImportNotes,
  } = useGitHubStore()

  const importNotes = useCallback(async () => {
    if (!user?.uid) return
    await storeImportNotes(user.uid)
  }, [storeImportNotes, user?.uid])

  return {
    isImporting,
    importResult,
    importNotes,
  }
}
