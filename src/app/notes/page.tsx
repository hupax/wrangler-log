import Link from 'next/link'

export default async function NotesPage() {
  const notes = [
    { id: '1', title: 'SSR Hydration 错误修复', createdAt: '2024-01-20' },
    { id: '2', title: 'TSX语法介绍', createdAt: '2024-01-19' },
    { id: '3', title: 'https-caddy', createdAt: '2024-01-18' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      { notes.map( note => (
        <Link
         key={note.id}
         href={`/notes/${note.id}`}
         >

         </Link>
      )) }
    </div>
  )
}
