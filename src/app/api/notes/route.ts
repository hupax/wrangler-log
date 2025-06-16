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
export async function GET() {
  try {
    const q = query(collection(db, 'notes'), orderBy('updatedAt', 'desc'))
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
      // noteType = 'general',
      // isGenerated = false,
    } = await request.json()

    const content = process(await generateNote(prompt))
    const title = await generateNoteTitle(content)

    const noteRef = await addDoc(collection(db, 'notes'), {
      title: title.trim(),
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      prompt: prompt || null,
    })

    return NextResponse.json({
      success: true,
      noteId: noteRef.id,
      title,
      content,
    })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
