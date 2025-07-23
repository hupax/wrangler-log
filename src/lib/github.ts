export interface GitHubConfig {
  accessToken: string
  repoOwner: string
  repoName: string
  defaultBranch: string
  basePath: string // 笔记在仓库中的基础路径
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

export class GitHubService {
  private config: GitHubConfig
  private readonly baseURL = 'https://api.github.com'

  constructor(config: GitHubConfig) {
    this.config = config
  }

  private get headers() {
    return {
      'Authorization': `token ${this.config.accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  }

  private get repoURL() {
    return `${this.baseURL}/repos/${this.config.repoOwner}/${this.config.repoName}`
  }

  // 测试连接 - 验证 token 和仓库访问权限
  async testConnection(): Promise<ConnectionResult> {
    try {
      const response = await fetch(this.repoURL, {
        headers: this.headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Connection failed' }))
        return {
          success: false,
          error: error.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // 获取仓库基本信息
  async getRepoInfo() {
    const response = await fetch(this.repoURL, {
      headers: this.headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.statusText}`)
    }

    return await response.json()
  }

  // 获取指定路径内容
  async getContents(path: string = ''): Promise<GitHubItem[]> {
    const fullPath = path ? `${this.config.basePath}/${path}` : this.config.basePath
    const url = `${this.repoURL}/contents/${fullPath}`

    const response = await fetch(url, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`Failed to fetch contents: ${response.statusText}`)
    }

    const data = await response.json()
    return Array.isArray(data) ? data : [data]
  }

  // 递归获取所有 markdown 文件
  async getAllMarkdownFiles(path: string = ''): Promise<GitHubItem[]> {
    const contents = await this.getContents(path)
    const markdownFiles: GitHubItem[] = []

    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        markdownFiles.push({
          ...item,
          relativePath: path ? `${path}/${item.name}` : item.name
        })
      } else if (item.type === 'dir') {
        const subFiles = await this.getAllMarkdownFiles(
          path ? `${path}/${item.name}` : item.name
        )
        markdownFiles.push(...subFiles)
      }
    }

    return markdownFiles
  }

  // 获取单个文件内容
  async getFileContent(path: string): Promise<FileContent | null> {
    const fullPath = `${this.config.basePath}/${path}`
    const url = `${this.repoURL}/contents/${fullPath}`

    const response = await fetch(url, {
      headers: this.headers,
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.content) {
      throw new Error('File content not available')
    }

    const content = decodeURIComponent(escape(atob(data.content)))

    return {
      content,
      sha: data.sha,
      path: data.path,
      size: data.size,
    }
  }
}
