'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'

export default function NotePage() {
  const params = useParams()
  const noteId = params.id as string
  const { isAuthenticated, user } = useAuthStore()
  const { fetchNote, currentNote } = useNotesStore()

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId || !isAuthenticated || !user?.uid) return

      try {
        const note = await fetchNote(noteId, user)
      } catch (error) {
        console.error('Failed to fetch note:', error)
      }
    }

    if (isAuthenticated && user?.uid) {
      loadNote()
    }
  }, [noteId, isAuthenticated, user, fetchNote])

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={currentNote?.content || ''} />
        </article>
      </div>
    </div>
  )
}
