import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

// 清理文件名（移除特殊字符）
function sanitizeFileName(title: string): string {
  return title
    .replace(/[<>:"/\\|?*]/g, '') // 移除Windows禁用字符
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
    .substring(0, 100) // 限制长度
}

// 构建文件夹路径
async function buildFolderPath(
  folderId: string | null,
  userId: string
): Promise<string> {
  if (!folderId) return '' // 根目录

  // 获取文件夹信息
  const folderDoc = await getDoc(doc(db, 'folders', folderId))
  if (!folderDoc.exists()) return ''

  const folderData = folderDoc.data()
  if (folderData.userId !== userId) return ''

  // 递归构建父级路径
  const parentPath = await buildFolderPath(folderData.parentId, userId)
  return parentPath ? `${parentPath}/${folderData.name}` : folderData.name
}

// 生成GitHub文件路径
async function generateGitHubFilePath(
  note: any,
  basePath: string,
  userId: string
): Promise<string> {
  // 1. 构建文件夹路径
  const folderPath = await buildFolderPath(note.folderId, userId)

  // 2. 清理文件名
  const fileName = sanitizeFileName(note.title) + '.md'

  // 3. 组合完整路径
  const fullPath = [basePath, folderPath, fileName]
    .filter(Boolean) // 移除空值
    .join('/')

  return fullPath
}

// 转换笔记为GitHub格式
function convertNoteToGitHubFormat(note: any) {
  // 处理Firebase Timestamp对象
  const getISOString = (timestamp: any) => {
    if (!timestamp) return new Date().toISOString()

    // 如果是Firebase Timestamp对象，调用toDate()
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString()
    }

    // 如果已经是Date对象或字符串，直接转换
    try {
      return new Date(timestamp).toISOString()
    } catch (error) {
      console.warn('Invalid timestamp, using current time:', timestamp)
      return new Date().toISOString()
    }
  }

  // 添加Front Matter（元数据）
  const frontMatter = `---
title: "${note.title}"
created: ${getISOString(note.createdAt)}
updated: ${getISOString(note.updatedAt)}
---

`

  // 组合完整内容
  const fullContent = frontMatter + note.content

  // 转换为Base64（GitHub API要求）
  const base64Content = btoa(unescape(encodeURIComponent(fullContent)))

  return {
    content: base64Content,
    rawContent: fullContent,
    encoding: 'base64',
  }
}

// 检查文件是否存在
async function checkFileExists(githubConfig: any, filePath: string) {
  try {
    const url = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${filePath}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${githubConfig.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        exists: true,
        sha: data.sha,
      }
    }

    return { exists: false }
  } catch (error) {
    return { exists: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { noteId, userId } = await request.json()

    if (!noteId || !userId) {
      return NextResponse.json(
        { error: 'NoteId and userId are required' },
        { status: 400 }
      )
    }

    console.log('Starting note push to GitHub...', { noteId, userId })

    // 1. 获取笔记数据
    const noteDoc = await getDoc(doc(db, 'notes', noteId))
    if (!noteDoc.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteData = { id: noteDoc.id, ...noteDoc.data() } as any

    // 验证笔记属于该用户
    if (noteData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. 获取GitHub配置
    const configResponse = await fetch(
      `${request.nextUrl.origin}/api/github/config?userId=${userId}`
    )
    if (!configResponse.ok) {
      return NextResponse.json(
        {
          error:
            'GitHub not configured. Please setup GitHub integration first.',
        },
        { status: 400 }
      )
    }

    const { config: githubConfig } = await configResponse.json()
    if (!githubConfig) {
      return NextResponse.json(
        { error: 'GitHub configuration not found' },
        { status: 400 }
      )
    }

    // 3. 生成文件路径
    const filePath = await generateGitHubFilePath(
      noteData,
      githubConfig.basePath,
      userId
    )
    console.log('Generated file path:', filePath)

    // 4. 转换内容格式
    const { content } = convertNoteToGitHubFormat(noteData)

    // 5. 检查文件是否存在
    const fileInfo = await checkFileExists(githubConfig, filePath)

    // 6. 创建GitHub API请求
    const githubApiUrl = `https://api.github.com/repos/${githubConfig.repoOwner}/${githubConfig.repoName}/contents/${filePath}`

    const body: any = {
      message: fileInfo.exists
        ? `Update note: ${noteData.title}`
        : `Add note: ${noteData.title}`,
      content,
      branch: githubConfig.defaultBranch || 'main',
    }

    // 如果文件已存在，需要提供SHA值进行更新
    if (fileInfo.exists && fileInfo.sha) {
      body.sha = fileInfo.sha
    }

    const response = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubConfig.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('GitHub API Error:', error)
      return NextResponse.json(
        { error: `GitHub API Error: ${error.message}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('Successfully pushed to GitHub:', result.content.html_url)

    // 7. 更新本地数据库中的GitHub信息
    await updateDoc(doc(db, 'notes', noteId), {
      githubPath: filePath,
      githubSha: result.content.sha,
      syncStatus: 'synced',
      lastSyncedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: 'Note successfully pushed to GitHub',
      githubPath: filePath,
      githubUrl: result.content.html_url,
      sha: result.content.sha,
    })
  } catch (error) {
    console.error('Error pushing note to GitHub:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to push note to GitHub',
      },
      { status: 500 }
    )
  }
}
