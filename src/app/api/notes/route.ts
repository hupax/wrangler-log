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

// POST - 创建新笔记（包括AI生成）
export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      userId,
    } = await request.json()

    // 验证必需的参数
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // console.log('Creating note for user:', userId, 'with prompt:', prompt)

    const content = process(await generateNote(prompt))
    const title = await generateNoteTitle(content)

    // console.log('Generated content and title:', {
    //   title,
    //   contentLength: content.length,
    // })

    // 使用嵌套集合结构：notes/{userId}/userNotes/{noteId}
    const noteRef = await addDoc(collection(db, 'notes', userId, 'userNotes'), {
      title: title.trim(),
      prompt: prompt,
      content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    // console.log('Note created successfully:', noteRef.id)

    return NextResponse.json({
      success: true,
      noteId: noteRef.id,
      title: title.trim(),
      content,
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
