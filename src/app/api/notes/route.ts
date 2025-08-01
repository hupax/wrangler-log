import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { generateNoteStream, generateNoteTitle } from '@/lib/ai'

// GET - 获取所有笔记
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
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

// POST - 流式生成笔记
export async function POST(request: NextRequest) {
  try {
    const { prompt, userId } = await request.json()

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Prompt and userId are required' },
        { status: 400 }
      )
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullContent = ''

        try {
          // 开始生成
          controller.enqueue(encoder.encode('data: {"type":"start"}\n\n'))

          // 获取流式响应
          const streamResponse = await generateNoteStream(prompt)

          // 处理流式数据
          for await (const chunk of streamResponse.stream) {
            const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              fullContent += text
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'content',
                    content: text,
                  })}\n\n`
                )
              )
            }
          }

          // 生成标题
          const title = await generateNoteTitle(fullContent)

          // 保存到数据库
          const noteRef = await addDoc(collection(db, 'notes'), {
            title,
            prompt,
            content: fullContent,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          // 发送完成信号
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'complete',
                noteId: noteRef.id,
                title,
                content: fullContent,
              })}\n\n`
            )
          )

          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: 'Failed to generate note',
              })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}

// PUT - 更新笔记
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')
    const userId = searchParams.get('userId')

    if (!noteId || !userId) {
      return NextResponse.json(
        { error: 'NoteId and userId are required' },
        { status: 400 }
      )
    }

    const { title, content, folderId } = await request.json()

    if (!title && !content && folderId === undefined) {
      return NextResponse.json(
        { error: 'At least one field (title, content, folderId) is required' },
        { status: 400 }
      )
    }

    // 检查笔记是否存在且属于该用户
    const noteRef = doc(db, 'notes', noteId)
    const noteSnap = await getDoc(noteRef)

    if (!noteSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteData = noteSnap.data()
    if (noteData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 构建更新数据
    const updateData: any = {
      updatedAt: serverTimestamp(),
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (folderId !== undefined) updateData.folderId = folderId

    // 更新笔记
    await updateDoc(noteRef, updateData)

    // 返回更新后的数据
    const updatedNoteSnap = await getDoc(noteRef)
    const updatedNote = {
      id: updatedNoteSnap.id,
      ...updatedNoteSnap.data(),
      createdAt: updatedNoteSnap.data()?.createdAt?.toDate(),
      updatedAt: updatedNoteSnap.data()?.updatedAt?.toDate(),
    }

    return NextResponse.json({ note: updatedNote })
  } catch (error) {
    console.error('Failed to update note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
}

// DELETE - 删除笔记
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('noteId')
    const userId = searchParams.get('userId')

    if (!noteId || !userId) {
      return NextResponse.json(
        { error: 'NoteId and userId are required' },
        { status: 400 }
      )
    }

    // 检查笔记是否存在且属于该用户
    const noteRef = doc(db, 'notes', noteId)
    const noteSnap = await getDoc(noteRef)

    if (!noteSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const noteData = noteSnap.data()
    if (noteData.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 删除笔记
    await deleteDoc(noteRef)

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
}
