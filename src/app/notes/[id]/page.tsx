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


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={currentNote?.content || ''} />
        </article>
      </div>
    </div>
  )
}
