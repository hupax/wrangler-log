import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPostContent } from '@/lib/posts'

export default async function Home() {
  const post = await getPostContent('https证书')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-white text-3xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-blue-100 text-sm">📅 {post.date}</span>
              {post.description && (
                <span className="text-blue-200 text-sm">
                  💡 {post.description}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <article className="prose prose-lg max-w-none px-8 py-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 标题样式
                h1: ({ children }) => (
                  <h1 className="text-4xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-blue-200">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-3xl font-semibold text-slate-800 mt-12 mb-4 pb-2 border-b border-slate-200">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-2xl font-semibold text-slate-700 mt-8 mb-3">
                    {children}
                  </h3>
                ),
                // 段落样式
                p: ({ children }) => (
                  <p className="text-slate-700 leading-relaxed mb-4 text-base">
                    {children}
                  </p>
                ),
                // 引用块样式
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-6 py-3 my-6 italic text-slate-700">
                    {children}
                  </blockquote>
                ),
                // 代码块样式
                code: ({ className, children }) => {
                  const isInline = !className
                  if (isInline) {
                    return (
                      <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-sm">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <div className="my-6">
                      <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono">{children}</code>
                      </pre>
                    </div>
                  )
                },
                pre: ({ children }) => children,
                // 列表样式
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-6 space-y-1 mb-4 text-slate-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-6 space-y-1 mb-4 text-slate-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-slate-700 leading-relaxed">{children}</li>
                ),
                // 表格样式
                table: ({ children }) => (
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full border-collapse border border-slate-300">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-slate-50">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-700">
                    {children}
                  </td>
                ),
                // 强调和链接
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t">
            <p className="text-sm text-slate-500 text-center">
              使用 Next.js + ReactMarkdown 渲染 | 现代化 Markdown 解决方案
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
