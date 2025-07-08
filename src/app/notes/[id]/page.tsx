'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useNotesStore } from '@/lib/store'

export default function NotePage() {
  const params = useParams()
  const noteId = params.id as string
  const { fetchNote, currentNote, isAuthenticated, user } = useNotesStore()

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
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={currentNote?.content || ''} />
        </article>
      </div>
    </div>
  )
}
