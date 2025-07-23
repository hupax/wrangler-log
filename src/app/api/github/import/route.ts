import { NextRequest, NextResponse } from 'next/server'
import { GitHubService } from '@/lib/github'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

// 查找现有笔记
async function findNoteByGithubPath(githubPath: string, userId: string) {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('githubPath', '==', githubPath)
  )
  const snapshot = await getDocs(q)
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

// 查找现有文件夹
async function findFolderByPath(githubPath: string, userId: string) {
  const q = query(
    collection(db, 'folders'),
    where('userId', '==', userId),
    where('githubPath', '==', githubPath)
  )
  const snapshot = await getDocs(q)
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

// 创建文件夹层级结构
async function createFolderStructure(files: any[], userId: string) {
  console.log('开始创建文件夹结构...')

  const folderMap = new Map<string, string>() // path -> folderId
  const folderPaths = new Set<string>()

  // 1. 收集所有需要创建的文件夹路径
  files.forEach(file => {
    const pathParts = file.path.split('/').slice(0, -1) // 移除文件名

    // 构建所有父级路径
    for (let i = 1; i <= pathParts.length; i++) {
      const folderPath = pathParts.slice(0, i).join('/')
      if (folderPath) {
        folderPaths.add(folderPath)
      }
    }
  })

  console.log('需要创建的文件夹:', Array.from(folderPaths))

  // 2. 按层级排序，确保父文件夹先创建
  const sortedPaths = Array.from(folderPaths).sort((a, b) => {
    return a.split('/').length - b.split('/').length
  })

  // 3. 创建文件夹
  for (const folderPath of sortedPaths) {
    const pathParts = folderPath.split('/')
    const folderName = pathParts[pathParts.length - 1]
    const parentPath = pathParts.slice(0, -1).join('/')
    const parentId = parentPath ? folderMap.get(parentPath) : null

    console.log(`处理文件夹: ${folderPath} (父级: ${parentPath || '根目录'})`)

    // 检查文件夹是否已存在
    const existingFolder = await findFolderByPath(folderPath, userId)

    if (existingFolder) {
      console.log(`✓ 文件夹已存在: ${folderPath}`)
      folderMap.set(folderPath, existingFolder.id)
    } else {
      // 创建新文件夹
      const folderRef = await addDoc(collection(db, 'folders'), {
        name: folderName,
        parentId,
        userId,
        githubPath: folderPath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log(`✓ 创建新文件夹: ${folderPath} (ID: ${folderRef.id})`)
      folderMap.set(folderPath, folderRef.id)
    }
  }

  console.log('文件夹结构创建完成，映射关系:', Object.fromEntries(folderMap))
  return folderMap
}

// 批量导入笔记
async function importNotes(files: any[], folderMap: Map<string, string>, userId: string, githubService: GitHubService) {
  console.log(`开始导入 ${files.length} 个笔记文件...`)

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as any[]
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      console.log(`[${i + 1}/${files.length}] 处理文件: ${file.path}`)

      // 检查笔记是否已存在
      const existingNote = await findNoteByGithubPath(file.path, userId)

      if (existingNote) {
        console.log(`- 笔记已存在，跳过: ${file.path}`)
        results.skipped++
        continue
      }

      // 获取文件内容
      const fileContent = await githubService.getFileContent(file.path)

      if (!fileContent) {
        console.log(`- 无法获取文件内容: ${file.path}`)
        results.failed++
        continue
      }

      // 确定文件夹ID
      const filePath = file.path.split('/').slice(0, -1).join('/')
      const folderId = filePath ? folderMap.get(filePath) : null

      console.log(`- 文件路径: ${filePath || '根目录'}, 文件夹ID: ${folderId || '无'}`)

      // 创建笔记
      const noteRef = await addDoc(collection(db, 'notes'), {
        title: file.name.replace('.md', ''),
        content: fileContent.content,
        userId,
        folderId,
        githubPath: file.path,
        githubSha: fileContent.sha,
        syncStatus: 'synced',
        lastSyncedAt: new Date(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log(`✓ 成功创建笔记: ${file.name} (ID: ${noteRef.id})`)
      results.success++

    } catch (error) {
      console.error(`✗ 导入失败: ${file.path}`, error)
      results.failed++
      results.errors.push({
        file: file.path,
        error: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  console.log('导入完成！结果:', results)
  return results
}

export async function POST(request: NextRequest) {
  try {
    const { userId, githubConfig } = await request.json()

    if (!userId || !githubConfig) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('开始GitHub导入流程...', { userId, repoOwner: githubConfig.repoOwner, repoName: githubConfig.repoName })

    const githubService = new GitHubService(githubConfig)

    // 1. 获取所有.md文件
    console.log('步骤1: 获取所有文件...')
    const allFiles = await githubService.getAllMarkdownFiles()
    console.log(`发现 ${allFiles.length} 个笔记文件`)

    if (allFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有找到任何.md文件',
        results: { success: 0, failed: 0, skipped: 0, errors: [] }
      })
    }

    // 2. 创建文件夹结构
    console.log('步骤2: 创建文件夹结构...')
    const folderMap = await createFolderStructure(allFiles, userId)

    // 3. 批量导入笔记
    console.log('步骤3: 导入笔记...')
    const importResults = await importNotes(allFiles, folderMap, userId, githubService)

    return NextResponse.json({
      success: true,
      message: '导入完成',
      results: importResults,
      totalFiles: allFiles.length
    })

  } catch (error) {
    console.error('导入过程出错:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : '导入失败'
    }, { status: 500 })
  }
}
