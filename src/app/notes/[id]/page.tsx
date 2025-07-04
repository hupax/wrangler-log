'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useNotesStore } from '@/lib/store'
import LoginButton from '@/components/auth/LoginButton'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  prompt?: string
}

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  const { fetchNote, currentNote, isAuthenticated, user, isLoading } =
    useNotesStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId || !isAuthenticated || !user?.uid) return

      try {
        const note = await fetchNote(noteId)
      } catch (error) {
        console.error('Failed to fetch note:', error)
      }
    }

    if (isAuthenticated && user?.uid) {
      loadNote()
    }
  }, [noteId, isAuthenticated, user?.uid, fetchNote])

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">需要登录</h1>
          <p className="text-gray-600 mb-8">请先登录以查看笔记</p>
          <LoginButton />
        </div>
      </div>
    )
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">错误</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  // 如果没有笔记数据
  if (!currentNote) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">笔记未找到</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={currentNote.content || ''} />
        </article>
      </div>
    </div>
  )
}
