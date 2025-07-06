import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { generateNote, generateNoteTitle } from '@/lib/ai'
import { process } from '@/lib/utils'

// GET - 获取所有笔记
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    const q = query(
      collection(db, 'notes', userId, 'userNotes'),
      orderBy('updatedAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }))

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST - 创建新笔记（包括AI生成和流式生成）
export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      userId,
      title,
      content,
      isStreamGenerated = false,
    } = await request.json()

    // 验证必需的参数
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    let finalTitle = title
    let finalContent = content

    // 如果是流式生成的笔记，直接使用提供的内容
    if (isStreamGenerated) {
      if (!title || !content) {
        return NextResponse.json(
          {
            error: 'Title and content are required for stream generated notes',
          },
          { status: 400 }
        )
      }
    } else {
      // 传统AI生成模式
      if (!prompt) {
        return NextResponse.json(
          { error: 'Prompt is required' },
          { status: 400 }
        )
      }

      finalContent = process(await generateNote(prompt))
      finalTitle = await generateNoteTitle(finalContent)
    }

    // 使用嵌套集合结构：notes/{userId}/userNotes/{noteId}
    const noteRef = await addDoc(collection(db, 'notes', userId, 'userNotes'), {
      title: finalTitle.trim(),
      prompt: prompt || '',
      content: finalContent,
      userId,
      isStreamGenerated,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      noteId: noteRef.id,
      title: finalTitle.trim(),
      content: finalContent,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note', details: error },
      { status: 500 }
    )
  }
}
