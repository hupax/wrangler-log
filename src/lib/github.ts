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
  _links: {
    self: string
    git: string
    html: string
  }
}

export class GitHubService {
  private config: GitHubConfig

  constructor(config: GitHubConfig) {
    this.config = config
  }

  // 测试连接 - 验证 token 和仓库访问权限
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`,
        {
          headers: {
            'Authorization': `token ${this.config.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.message || 'Failed to connect to GitHub',
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // 获取仓库基本信息
  async getRepoInfo() {
    const response = await fetch(
      `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}`,
      {
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch repository information')
    }

    return await response.json()
  }

  // 获取指定路径内容
  async getContents(path: string = ''): Promise<GitHubItem[]> {
    const fullPath = path
      ? `${this.config.basePath}/${path}`
      : this.config.basePath

    const response = await fetch(
      `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${fullPath}`,
      {
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return []
      } else {
        throw new Error('Failed to fetch file contents')
      }
    }

    const data = await response.json()
    // 确保返回数组格式
    return Array.isArray(data) ? data : [data]
  }

  // 递归获取所有内容
  async getAllContents(path: string = ''): Promise<GitHubItem[]> {
    console.log(`正在获取路径: ${path || '根目录'}`)

    const contents = await this.getContents(path)
    const allItems: GitHubItem[] = []

    console.log(`发现 ${contents.length} 个项目:`, contents.map(item => `${item.name} (${item.type})`))

    for (const item of contents) {
      if (item.type === 'file') {
        // 只收集 .md 文件
        if (item.name.endsWith('.md')) {
          console.log(`✓ 找到笔记文件: ${item.path}`)
          allItems.push({
            ...item,
            // 添加相对路径信息
            relativePath: path ? `${path}/${item.name}` : item.name
          } as GitHubItem & { relativePath: string })
        } else {
          console.log(`- 跳过非markdown文件: ${item.name}`)
        }
      } else if (item.type === 'dir') {
        console.log(`📁 进入文件夹: ${item.name}`)
        // 递归获取文件夹内容
        const subItems = await this.getAllContents(
          path ? `${path}/${item.name}` : item.name
        )
        allItems.push(...subItems)
        console.log(`📁 ${item.name} 文件夹处理完成，找到 ${subItems.length} 个文件`)
      }
    }

    console.log(`路径 ${path || '根目录'} 总共找到 ${allItems.length} 个笔记文件`)
    return allItems
  }

  // 获取单个文件内容
  async getFileContent(path: string) {
    console.log(`正在获取文件内容: ${path}`)

    const fullPath = `${this.config.basePath}/${path}`

    const response = await fetch(
      `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${fullPath}`,
      {
        headers: {
          'Authorization': `token ${this.config.accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`文件不存在: ${path}`)
        return null
      }
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const data = await response.json()
    const content = decodeURIComponent(escape(atob(data.content)))

    console.log(`✓ 成功获取文件内容: ${path} (${content.length} 字符)`)

    return {
      content,
      sha: data.sha,
      path: data.path,
      size: data.size,
    }
  }
}
