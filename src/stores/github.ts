import { create } from 'zustand'

// GitHub 类型定义
export interface GitHubConfig {
  accessToken: string
  repoOwner: string
  repoName: string
  defaultBranch: string
  basePath: string
}

export interface GitHubItem {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  content?: string
  encoding?: string
  relativePath?: string
  _links: {
    self: string
    git: string
    html: string
  }
}

export interface ConnectionResult {
  success: boolean
  error?: string
}

export interface FileContent {
  content: string
  sha: string
  path: string
  size: number
}

export interface ImportResult {
  success: boolean
  message: string
  results?: {
    success: number
    skipped: number
    failed: number
    errors?: Array<{
      file: string
      error: string
    }>
  }
}

export interface RepoInfo {
  full_name: string
  description: string
  default_branch: string
  private: boolean
}

// Store 接口
interface GitHubStore {
  // 配置状态
  githubConfig: GitHubConfig | null
  isGitHubConnected: boolean

  // 连接状态
  isConnecting: boolean
  connectionResult: (ConnectionResult & { message: string }) | null
  repoInfo: RepoInfo | null

  // 导入状态
  isImporting: boolean
  importResult: ImportResult | null

  // 配置操作
  setGitHubConfig: (config: GitHubConfig | null) => void
  setGitHubConnected: (connected: boolean) => void
  clearGitHubData: () => void

  // 连接操作
  setConnecting: (connecting: boolean) => void
  setConnectionResult: (result: (ConnectionResult & { message: string }) | null) => void
  setRepoInfo: (repoInfo: RepoInfo | null) => void
  testConnection: (config: GitHubConfig, userId: string) => Promise<void>
  disconnect: (userId: string) => Promise<void>

  // 导入操作
  setImporting: (importing: boolean) => void
  setImportResult: (result: ImportResult | null) => void
  importNotes: (userId: string) => Promise<void>
}

export const useGitHubStore = create<GitHubStore>((set, get) => ({
  // 配置状态
  githubConfig: null,
  isGitHubConnected: false,

  // 连接状态
  isConnecting: false,
  connectionResult: null,
  repoInfo: null,

  // 导入状态
  isImporting: false,
  importResult: null,

  // 配置操作
  setGitHubConfig: config => set({ githubConfig: config }),
  setGitHubConnected: connected => set({ isGitHubConnected: connected }),
  clearGitHubData: () =>
    set({
      githubConfig: null,
      isGitHubConnected: false,
      connectionResult: null,
      repoInfo: null,
      importResult: null,
    }),

  // 连接操作
  setConnecting: connecting => set({ isConnecting: connecting }),
  setConnectionResult: result => set({ connectionResult: result }),
  setRepoInfo: repoInfo => set({ repoInfo }),

  // 测试连接方法
  testConnection: async (config: GitHubConfig, userId: string) => {
    if (!config.accessToken || !config.repoOwner || !config.repoName) {
      set({
        connectionResult: {
          success: false,
          message: 'Please fill in all required fields',
        }
      })
      return
    }

    set({ isConnecting: true, connectionResult: null })

    try {
      // 动态导入 GitHubService 以避免循环依赖
      const { GitHubService } = await import('@/lib/github')
      const githubService = new GitHubService(config)

      const connectionResult = await githubService.testConnection()
      if (connectionResult.success) {
        const repoInfo = await githubService.getRepoInfo()

        // 保存配置到数据库
        const response = await fetch('/api/github/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            config: { ...config, accessToken: '[HIDDEN]' },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save GitHub config')
        }

        set({
          githubConfig: config,
          isGitHubConnected: true,
          repoInfo,
          connectionResult: {
            success: true,
            message: `✅ Connected successfully! Repository: ${repoInfo.full_name}`,
          },
        })
      } else {
        set({
          connectionResult: {
            success: false,
            message: `❌ Connection failed: ${connectionResult.error}`,
          },
        })
      }
    } catch (error) {
      set({
        connectionResult: {
          success: false,
          message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      })
    } finally {
      set({ isConnecting: false })
    }
  },

  // 断开连接方法
  disconnect: async (userId: string) => {
    try {
      const response = await fetch('/api/github/config', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove GitHub config')
      }

      set({
        githubConfig: null,
        isGitHubConnected: false,
        repoInfo: null,
        connectionResult: null,
        importResult: null,
      })
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  },

  // 导入操作
  setImporting: importing => set({ isImporting: importing }),
  setImportResult: result => set({ importResult: result }),

  // 导入笔记方法
  importNotes: async (userId: string) => {
    const { githubConfig } = get()

    if (!githubConfig) {
      set({
        importResult: {
          success: false,
          message: 'Please configure GitHub connection first',
        }
      })
      return
    }

    set({ isImporting: true, importResult: null })

    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          githubConfig,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        set({
          importResult: {
            success: true,
            message: `✅ ${result.message}`,
            results: result.results,
          },
        })
      } else {
        set({
          importResult: {
            success: false,
            message: `❌ Import failed: ${result.error || 'Unknown error'}`,
          },
        })
      }
    } catch (error) {
      set({
        importResult: {
          success: false,
          message: `❌ Import error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      })
    } finally {
      set({ isImporting: false })
    }
  },
}))
