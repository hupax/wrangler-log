import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  date: string
  description?: string
  content: string
}

const postsDirectory = path.join(process.cwd(), 'src/app')

export async function getPostContent(filename: string): Promise<BlogPost> {
  const filePath = path.join(postsDirectory, `${filename}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')

  // 简单的 frontmatter 解析
  const lines = fileContents.split('\n')
  let content = fileContents
  let title = 'Untitled'
  let date = new Date().toISOString().split('T')[0]
  let description = ''

  // 检查是否有 frontmatter
  if (lines[0] === '---') {
    const frontmatterEnd = lines.findIndex(
      (line, index) => index > 0 && line === '---'
    )
    if (frontmatterEnd > 0) {
      const frontmatter = lines.slice(1, frontmatterEnd)
      content = lines.slice(frontmatterEnd + 1).join('\n')

      // 解析简单的 frontmatter
      frontmatter.forEach(line => {
        const [key, ...values] = line.split(':')
        const value = values.join(':').trim()
        if (key.trim() === 'title') title = value.replace(/['"]/g, '')
        if (key.trim() === 'date') date = value.replace(/['"]/g, '')
        if (key.trim() === 'description')
          description = value.replace(/['"]/g, '')
      })
    }
  }

  return {
    slug: filename,
    title,
    date,
    description,
    content: content.trim(),
  }
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = fs.readdirSync(postsDirectory)
  const mdFiles = files.filter(file => file.endsWith('.md'))

  const posts = await Promise.all(
    mdFiles.map(async file => {
      const filename = file.replace('.md', '')
      return getPostContent(filename)
    })
  )

  // 按日期排序
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
