import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Note } from '@/stores/notes'
import { MoreOptionsIcon } from '../icons'

interface NoteListProps {
  notes: Note[]
  onOptionsClick: (e: React.MouseEvent, noteId: string) => void
  buttonRefs: React.MutableRefObject<{
    [key: string]: HTMLButtonElement | null
  }>
}

export default function NoteList({
  notes,
  onOptionsClick,
  buttonRefs,
}: NoteListProps) {
  const pathname = usePathname() || '/notes/1'

  const handleLinkClick = (e: React.MouseEvent, noteHref: string) => {
    if (pathname === noteHref) {
      e.preventDefault()
      return
    }
  }

  // 获取根目录下的笔记（没有folderId的笔记）
  const rootNotes = notes.filter(note => !note.folderId)

  return (
    <>
      {rootNotes.map(note => (
        <Link
          key={`root-note-${note.id}`}
          href={`/notes/${note.id}`}
          prefetch={true}
          onClick={e => handleLinkClick(e, `/notes/${note.id}`)}
          className={`group flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:bg-[rgb(239,239,239)] duration-200 ${
            pathname === `/notes/${note.id}` ? 'bg-[rgb(239,239,239)]' : ''
          }`}
          draggable="true"
        >
          <div className="flex min-w-0 grow items-center gap-2">
            <div className="truncate">
              <span
                className={`text-sm ${
                  pathname === `/notes/${note.id}`
                    ? 'text-gray-800'
                    : 'text-gray-700'
                }`}
                dir="auto"
              >
                {note.title}
              </span>
            </div>
          </div>

          <div className="text-gray-500 flex items-center self-stretch">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                ref={el => {
                  if (el) buttonRefs.current[note.id] = el
                }}
                className="w-7 h-7 flex items-center justify-center transition-all duration-150 cursor-pointer"
                onClick={e => onOptionsClick(e, note.id)}
                aria-label="Open note options"
              >
                <MoreOptionsIcon
                  width={20}
                  height={20}
                  className="w-5 h-5 text-gray-700"
                />
              </button>
            </div>
          </div>
        </Link>
      ))}
    </>
  )
}
