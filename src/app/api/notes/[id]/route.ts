import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

// GET - 获取单个笔记
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    // 使用扁平化结构：notes/{noteId}
    const docRef = doc(db, 'notes', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteData = docSnap.data()

    // 验证用户权限
    if (noteData.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const note = {
      id: docSnap.id,
      ...noteData,
      createdAt: noteData?.createdAt?.toDate(),
      updatedAt: noteData?.updatedAt?.toDate(),
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Failed to fetch note:', error)
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

// PUT - 更新笔记
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const { title, content } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    // 使用扁平化结构：notes/{noteId}
    const docRef = doc(db, 'notes', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // 验证用户权限
    if (docSnap.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await updateDoc(docRef, {
      title,
      content,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE - 删除笔记
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    // 使用扁平化结构：notes/{noteId}
    const docRef = doc(db, 'notes', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // 验证用户权限
    if (docSnap.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await deleteDoc(docRef)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
