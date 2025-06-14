import fs from 'fs'
import path from 'path'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default async function Home() {
  // 读取markdown文件内容
  const markdownPath = path.join(process.cwd(), 'src', 'app', 'https证书.md')
  const markdownContent = fs.readFileSync(markdownPath, 'utf8')

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* 主要内容区域 */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-purple-100 dark:border-purple-800">
            {/* 内容头部装饰 */}
            <div className="h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>

            {/* 文章内容 */}
            <article className="p-8 md:p-12">
              <MarkdownRenderer content={markdownContent} />
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
