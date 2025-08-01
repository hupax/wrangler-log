'use client'

import { useEffect } from 'react'
import { useGitHubStore } from '@/stores/github'
import { useGitHubConnection, useGitHubImport } from '@/hooks/useGitHub'
import { GitHubIcon, ConnectedIcon, DisconnectedIcon } from './icons'

// 连接状态组件
function ConnectionStatus({ isConnected, repoInfo, config }: any) {
  if (!isConnected) return null

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <ConnectedIcon width={16} height={16} className="text-green-600" />
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
  )
}

// 连接表单组件
function ConnectionForm({ config, setConfig, onConnect, isLoading }: any) {
  return (
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
          onChange={e => setConfig({ ...config, accessToken: e.target.value })}
          placeholder="ghp_xxxxxxxxxxxx"
        />
        <p className="text-sm text-gray-500 mt-1">
          在 GitHub Settings → Developer settings → Personal access tokens
          中创建
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">仓库所有者 *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={config.repoOwner}
            onChange={e => setConfig({ ...config, repoOwner: e.target.value })}
            placeholder="your-username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">仓库名称 *</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={config.repoName}
            onChange={e => setConfig({ ...config, repoName: e.target.value })}
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
            onChange={e => setConfig({ ...config, basePath: e.target.value })}
            placeholder="notes/"
          />
        </div>
      </div>

      <button
        onClick={onConnect}
        disabled={isLoading}
        className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '连接中...' : '连接 GitHub'}
      </button>
    </div>
  )
}

// 导入面板组件
function ImportPanel({ isImporting, onImport, importResult }: any) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-medium text-blue-900 mb-2">导入笔记</h3>
      <p className="text-sm text-blue-800 mb-3">
        从GitHub仓库导入所有.md文件到应用中，支持文件夹结构
      </p>
      <button
        onClick={onImport}
        disabled={isImporting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isImporting ? '正在导入...' : '导入所有笔记'}
      </button>

      {/* 导入结果显示 */}
      {importResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            importResult.success
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm font-medium">{importResult.message}</p>
          {importResult.results && (
            <div className="mt-2 text-xs">
              <p>✅ 成功: {importResult.results.success} 个</p>
              <p>⏭️ 跳过: {importResult.results.skipped} 个</p>
              <p>❌ 失败: {importResult.results.failed} 个</p>
              {importResult.results.errors?.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">查看错误详情</summary>
                  <div className="mt-1 pl-2 border-l-2 border-red-300">
                    {importResult.results.errors.map(
                      (error: any, index: number) => (
                        <p key={index} className="text-xs">
                          {error.file}: {error.error}
                        </p>
                      )
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 结果显示组件
function ResultMessage({ result }: any) {
  if (!result) return null

  return (
    <div
      className={`p-4 rounded-lg ${
        result.success
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}
    >
      <p className="text-sm">{result.message}</p>
    </div>
  )
}

export default function GithubSettings() {
  const { isGitHubConnected } = useGitHubStore()
  const {
    config,
    setConfig,
    isLoading,
    testResult,
    repoInfo,
    connect,
    disconnect,
  } = useGitHubConnection()
  const { isImporting, importResult, importNotes } = useGitHubImport()

  // 同步配置状态
  useEffect(() => {
    if (isGitHubConnected) {
      const { githubConfig } = useGitHubStore.getState()
      if (githubConfig) {
        setConfig(githubConfig)
      }
    }
  }, [isGitHubConnected, setConfig])

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
        <>
          <ConnectionForm
            config={config}
            setConfig={setConfig}
            onConnect={connect}
            isLoading={isLoading}
          />
          <ResultMessage result={testResult} />
        </>
      ) : (
        <div className="space-y-4">
          <ConnectionStatus
            isConnected={isGitHubConnected}
            repoInfo={repoInfo}
            config={config}
          />

          <ImportPanel
            isImporting={isImporting}
            onImport={importNotes}
            importResult={importResult}
          />

          <div className="flex gap-3">
            <button
              onClick={disconnect}
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
