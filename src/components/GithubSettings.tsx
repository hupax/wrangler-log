'use client'

import { useNotesStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { GitHubConfig, GitHubService } from '@/lib/github'
import { GitHubIcon, ConnectedIcon, DisconnectedIcon } from './icons'

export default function GithubSettings() {
  const {
    githubConfig,
    setGithubConfig,
    isGitHubConnected,
    setGithubConnected,
    user,
  } = useNotesStore()

  const [config, setConfig] = useState<GitHubConfig>({
    accessToken: githubConfig?.accessToken || '',
    repoOwner: githubConfig?.repoOwner || '',
    repoName: githubConfig?.repoName || '',
    defaultBranch: githubConfig?.defaultBranch || 'main',
    basePath: githubConfig?.basePath || 'dev',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [repoInfo, setRepoInfo] = useState<{
    full_name: string
    description: string
    default_branch: string
    private: boolean
  } | null>(null)

  // 加载已保存的配置
  useEffect(() => {
    if (githubConfig) {
      setConfig(githubConfig)
    }
  }, [githubConfig])

  const handleConnect = async () => {
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

      // Test connection
      const connectionResult = await githubService.testConnection()
      if (connectionResult.success) {
        // Get repository info
        const repoInfo = await githubService.getRepoInfo()
        setRepoInfo(repoInfo)

        // 保存到状态管理
        setGithubConfig(config)
        setGithubConnected(true)

        // TODO: 保存到数据库
        await saveGithubConfigToDatabase(config)

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
        message: `❌ 错误：${
          error instanceof Error ? error.message : '未知错误'
        }`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setGithubConfig(null)
    setGithubConnected(false)
    setRepoInfo(null)
    setTestResult(null)

    // TODO: 删除数据库中的配置
    await removeGithubConfigFromDatabase()
  }

  const saveGithubConfigToDatabase = async (config: GitHubConfig) => {
    try {
      const response = await fetch('/api/github/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
          config: {
            ...config,
            accessToken: config.accessToken ? '[HIDDEN]' : '',
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save GitHub config')
      }
    } catch (error) {
      console.error('Error saving GitHub config:', error)
      throw error
    }
  }

  const removeGithubConfigFromDatabase = async () => {
    try {
      const response = await fetch('/api/github/config', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.uid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove GitHub config')
      }
    } catch (error) {
      console.error('Error removing GitHub config:', error)
    }
  }

  return (
    <div className="github-settings max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <GitHubIcon width={24} height={24} />
        <h2 className="text-xl font-semibold">GitHub 集成设置</h2>
        {isGitHubConnected && (
          <div className="flex items-center gap-1 text-green-600">
            <ConnectedIcon width={16} height={16} />
            <span className="text-sm">已连接</span>
          </div>
        )}
      </div>

      {!isGitHubConnected ? (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">设置说明</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 需要 GitHub Personal Access Token（具有 repo 权限）</li>
              <li>• 笔记将同步到指定仓库的 notes/ 目录</li>
              <li>• 支持双向同步：应用 ↔ GitHub</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Personal Access Token *
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={config.accessToken}
              onChange={e =>
                setConfig({ ...config, accessToken: e.target.value })
              }
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <p className="text-sm text-gray-500 mt-1">
              在 GitHub Settings → Developer settings → Personal access tokens
              中创建
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                仓库所有者 *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.repoOwner}
                onChange={e =>
                  setConfig({ ...config, repoOwner: e.target.value })
                }
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                仓库名称 *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.repoName}
                onChange={e =>
                  setConfig({ ...config, repoName: e.target.value })
                }
                placeholder="my-notes"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">默认分支</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.defaultBranch}
                onChange={e =>
                  setConfig({ ...config, defaultBranch: e.target.value })
                }
                placeholder="main"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">笔记目录</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={config.basePath}
                onChange={e =>
                  setConfig({ ...config, basePath: e.target.value })
                }
                placeholder="notes/"
              />
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '连接中...' : '连接 GitHub'}
          </button>

          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <p className="text-sm">{testResult.message}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ConnectedIcon
                width={16}
                height={16}
                className="text-green-600"
              />
              <h3 className="font-medium text-green-900">GitHub 已连接</h3>
            </div>
            {repoInfo && (
              <div className="text-sm text-green-800 space-y-1">
                <p>
                  <strong>仓库：</strong> {repoInfo.full_name}
                </p>
                <p>
                  <strong>描述：</strong> {repoInfo.description || '无描述'}
                </p>
                <p>
                  <strong>默认分支：</strong> {repoInfo.default_branch}
                </p>
                <p>
                  <strong>私有仓库：</strong> {repoInfo.private ? '是' : '否'}
                </p>
                <p>
                  <strong>笔记目录：</strong> {config.basePath}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              断开连接
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://github.com/${config.repoOwner}/${config.repoName}`,
                  '_blank'
                )
              }
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              查看仓库
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
