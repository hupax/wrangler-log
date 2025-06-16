import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default async function Home() {
  // 读取markdown文件内容
  const markdownPath = path.join(process.cwd(), 'src', 'lib', 'https证书.md')
  const markdownContent = fs.readFileSync(markdownPath, 'utf8')


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <article className="p-8 md:p-12">
          <MarkdownRenderer content={markdownContent} />
        </article>
      </div>
    </div>
  )
}
