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
