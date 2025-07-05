export interface GitHubConfig {
  accessToken: string
  repoOwner: string
  repoName: string
  defaultBranch: string
  basePath: string // 笔记在仓库中的基础路径
}

export class GitHubService {
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
  }

  // 测试连接 - 验证 token 和仓库访问权限
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`, {
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to connect to GitHub'
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 获取仓库基本信息
  async getRepoInfo() {
    const response = await fetch(`https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`, {
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch repository information')
    }

    return await response.json()
  }

  // 获取指定路径内容
  async getContents(path: string = '') {
    const fullPath = path ? `${this.config.basePath}/${path}` : this.config.basePath

    const response = await fetch(`https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${fullPath}`, {
      headers: {
        'Authorization': `token ${this.config.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      } else {
        throw new Error('Failed to fetch file contents')
      }
    }

    return response.json()
  }



}
