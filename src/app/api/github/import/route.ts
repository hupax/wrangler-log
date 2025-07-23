import { NextRequest, NextResponse } from 'next/server'
import { GitHubService } from '@/lib/github'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

// 查找现有笔记
async function findNoteByGithubPath(githubPath: string, userId: string) {
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    where('githubPath', '==', githubPath)
  )
  const snapshot = await getDocs(q)
  return snapshot.empty
    ? null
    : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

// 查找现有文件夹
async function findFolderByPath(githubPath: string, userId: string) {
  const q = query(
    collection(db, 'folders'),
    where('userId', '==', userId),
    where('githubPath', '==', githubPath)
  )
  const snapshot = await getDocs(q)
  return snapshot.empty
    ? null
    : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

// 创建文件夹层级结构
async function createFolderStructure(files: any[], userId: string) {
  console.log('Starting folder structure creation...')

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

  console.log('Folders to create:', Array.from(folderPaths))

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

    console.log(
      `Processing folder: ${folderPath} (parent: ${parentPath || 'root'})`
    )

    // 检查文件夹是否已存在
    const existingFolder = await findFolderByPath(folderPath, userId)

    if (existingFolder) {
      console.log(`✓ Folder already exists: ${folderPath}`)
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

      console.log(`✓ Created new folder: ${folderPath} (ID: ${folderRef.id})`)
      folderMap.set(folderPath, folderRef.id)
    }
  }

  console.log(
    'Folder structure creation completed, mapping:',
    Object.fromEntries(folderMap)
  )
  return folderMap
}

// 批量导入笔记
async function importNotes(
  files: any[],
  folderMap: Map<string, string>,
  userId: string,
  githubService: GitHubService
) {
  console.log(`Starting import of ${files.length} note files...`)

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [] as any[],
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      console.log(`[${i + 1}/${files.length}] Processing file: ${file.path}`)

      // 检查笔记是否已存在
      const existingNote = await findNoteByGithubPath(file.path, userId)

      if (existingNote) {
        console.log(`- Note already exists, skipping: ${file.path}`)
        results.skipped++
        continue
      }

      // 获取文件内容
      const fileContent = await githubService.getFileContent(file.path)

      if (!fileContent) {
        console.log(`- Unable to get file content: ${file.path}`)
        results.failed++
        continue
      }

      // 确定文件夹ID
      const filePath = file.path.split('/').slice(0, -1).join('/')
      const folderId = filePath ? folderMap.get(filePath) : null

      console.log(
        `- File path: ${filePath || 'root'}, folder ID: ${folderId || 'none'}`
      )

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

      console.log(`✓ Successfully created note: ${file.name} (ID: ${noteRef.id})`)
      results.success++
    } catch (error) {
      console.error(`✗ Import failed: ${file.path}`, error)
      results.failed++
      results.errors.push({
        file: file.path,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  console.log('Import completed! Results:', results)
  return results
}

export async function POST(request: NextRequest) {
  try {
    const { userId, githubConfig } = await request.json()

    if (!userId || !githubConfig) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Starting GitHub import process...', {
      userId,
      repoOwner: githubConfig.repoOwner,
      repoName: githubConfig.repoName,
    })

    const githubService = new GitHubService(githubConfig)

    // 1. 获取所有.md文件
    console.log('Step 1: Getting all files...')
    const allFiles = await githubService.getAllMarkdownFiles()
    console.log(`Found ${allFiles.length} note files`)

    if (allFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No .md files found',
        results: { success: 0, failed: 0, skipped: 0, errors: [] },
      })
    }

    // 2. 创建文件夹结构
    console.log('Step 2: Creating folder structure...')
    const folderMap = await createFolderStructure(allFiles, userId)

    // 3. 批量导入笔记
    console.log('Step 3: Importing notes...')
    const importResults = await importNotes(
      allFiles,
      folderMap,
      userId,
      githubService
    )

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      results: importResults,
      totalFiles: allFiles.length,
    })
  } catch (error) {
    console.error('Error during import process:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}
