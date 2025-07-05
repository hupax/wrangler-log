'use client'
import { useState } from 'react'
import { GitHubConfig, GitHubService } from '@/lib/github'

export default function GitHubTestPage() {
  const [config, setConfig] = useState<GitHubConfig>({
    accessToken: '',
    repoOwner: '',
    repoName: '',
    defaultBranch: 'main',
    basePath: 'dev',
  })

  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    if (!config.accessToken || !config.repoOwner || !config.repoName) {
      setTestResult('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setTestResult('')
    try {
      const githubService = new GitHubService(config)

      // 测试连接
      const connectionResult = await githubService.testConnection()
      if (connectionResult.success) {
        // 获取仓库信息
        const repoInfo = await githubService.getRepoInfo()
        setTestResult(`✅ 连接成功！
                          仓库：${repoInfo.full_name}
                          描述：${repoInfo.description || '无描述'}
                          默认分支：${repoInfo.default_branch}
                          私有仓库：${repoInfo.private ? '是' : '否'}`)
      } else {
        setTestResult(`❌ 连接失败：${connectionResult.error}`)
      }
    } catch (error) {
      setTestResult(
        `❌ 错误：${error instanceof Error ? error.message : '未知错误'}`
      )
    } finally {
      setIsLoading(false)
    }
  }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">GitHub 连接测试</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={config.accessToken}
              onChange={e =>
                setConfig({ ...config, accessToken: e.target.value })
              }
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <p className="text-sm text-gray-500 mt-1">
              需要 repo 权限的 Personal Access Token
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                仓库所有者
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={config.repoOwner}
                onChange={e =>
                  setConfig({ ...config, repoOwner: e.target.value })
                }
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">仓库名称</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={config.basePath}
                onChange={e =>
                  setConfig({ ...config, basePath: e.target.value })
                }
                placeholder="notes/"
              />
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '测试中...' : '测试 GitHub 连接'}
          </button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </div>
      </div>
    )

}
