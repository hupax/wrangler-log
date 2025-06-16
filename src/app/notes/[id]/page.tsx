'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { useNotesStore } from '@/lib/store'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  prompt?: string
}

export default function NotePage() {
  const params = useParams()
  const noteId = params.id as string
  const [note, setNote] = useState<Note | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return

      try {
        const response = await fetch(`/api/notes/${noteId}`)
        const data = await response.json()
        setNote(data.note)
        // console.log(data.note, 'note')
      } catch (error) {
        console.error('Failed to fetch note:', error)
      }
    }
    fetchNote()
  }, [noteId])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={note?.content || ''} />
        </article>
      </div>
    </div>
  )
}
