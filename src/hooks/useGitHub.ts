import { useState, useCallback } from 'react'
import { useGitHubStore } from '@/stores/github'
import { useAuthStore } from '@/stores/auth'
import { GitHubConfig, GitHubService, ConnectionResult } from '@/lib/github'

interface UseGitHubConnectionReturn {
  config: GitHubConfig
  setConfig: (config: GitHubConfig) => void
  isLoading: boolean
  testResult: ConnectionResult & { message: string } | null
  repoInfo: any | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export function useGitHubConnection(): UseGitHubConnectionReturn {
  const { user } = useAuthStore()
  const {
    githubConfig,
    setGitHubConfig,
    isGitHubConnected,
    setGitHubConnected
  } = useGitHubStore()

  const [config, setConfig] = useState<GitHubConfig>({
    accessToken: githubConfig?.accessToken || '',
    repoOwner: githubConfig?.repoOwner || '',
    repoName: githubConfig?.repoName || '',
    defaultBranch: githubConfig?.defaultBranch || 'main',
    basePath: githubConfig?.basePath || '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [repoInfo, setRepoInfo] = useState<any | null>(null)

  const saveConfigToDatabase = async (config: GitHubConfig) => {
    const response = await fetch('/api/github/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.uid,
        config: { ...config, accessToken: '[HIDDEN]' },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save GitHub config')
    }
  }

  const removeConfigFromDatabase = async () => {
    const response = await fetch('/api/github/config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.uid }),
    })

    if (!response.ok) {
      throw new Error('Failed to remove GitHub config')
    }
  }

  const connect = useCallback(async () => {
    if (!config.accessToken || !config.repoOwner || !config.repoName) {
      setTestResult({
        success: false,
        message: 'Please fill in all required fields',
      })
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const githubService = new GitHubService(config)

      const connectionResult = await githubService.testConnection()
      if (connectionResult.success) {
        const repoInfo = await githubService.getRepoInfo()
        setRepoInfo(repoInfo)

        setGitHubConfig(config)
        setGitHubConnected(true)
        await saveConfigToDatabase(config)

        setTestResult({
          success: true,
          message: `✅ 连接成功！仓库：${repoInfo.full_name}`,
        })
      } else {
        setTestResult({
          success: false,
          message: `❌ 连接失败：${connectionResult.error}`,
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ 错误：${error instanceof Error ? error.message : '未知错误'}`,
      })
    } finally {
      setIsLoading(false)
    }
  }, [config, setGitHubConfig, setGitHubConnected, user])

  const disconnect = useCallback(async () => {
    setGitHubConfig(null)
    setGitHubConnected(false)
    setRepoInfo(null)
    setTestResult(null)
    await removeConfigFromDatabase()
  }, [setGitHubConfig, setGitHubConnected])

  return {
    config,
    setConfig,
    isLoading,
    testResult,
    repoInfo,
    connect,
    disconnect,
  }
}

interface UseGitHubImportReturn {
  isImporting: boolean
  importResult: {
    success: boolean
    message: string
    results?: any
  } | null
  importNotes: () => Promise<void>
}

export function useGitHubImport(): UseGitHubImportReturn {
  const { user } = useAuthStore()
  const { githubConfig } = useGitHubStore()
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    results?: any
  } | null>(null)

  const importNotes = useCallback(async () => {
    if (!user || !githubConfig) {
      setImportResult({
        success: false,
        message: '请先完成GitHub配置和用户登录',
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          githubConfig,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setImportResult({
          success: true,
          message: `✅ ${result.message}`,
          results: result.results,
        })
      } else {
        setImportResult({
          success: false,
          message: `❌ 导入失败：${result.error || '未知错误'}`,
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: `❌ 导入出错：${error instanceof Error ? error.message : '未知错误'}`,
      })
    } finally {
      setIsImporting(false)
    }
  }, [user, githubConfig])

  return {
    isImporting,
    importResult,
    importNotes,
  }
}
