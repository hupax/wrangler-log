import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default async function NotePage({ params } : { params: { id: string } }) {
  // 读取markdown文件内容
  const markdownPath = path.join(process.cwd(), 'src', 'lib', 'https证书.md')
  const markdownContent = fs.readFileSync(markdownPath, 'utf8')

  const markdownPath1 = path.join(process.cwd(), 'src', 'lib', '中文乱码.md')
  const markdownContent1 = fs.readFileSync(markdownPath1, 'utf8')

    const getNoteById = (id: string) => {
      const notes = {
        '1': { content: markdownContent },
        '2': { content: markdownContent1 },
        '3': { content: '# Caddy配置\n...' },
      }
      return notes[id as keyof typeof notes]
    }

    const note = getNoteById(params.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={note.content} />
        </article>
      </div>
    </div>
  )
}
