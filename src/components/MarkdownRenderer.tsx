'use client'

import React, { useEffect, useState } from 'react'
import Prism from 'prismjs'
import '../styles/code-block.css'

// 导入需要的语言支持
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-docker'

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface ListItem {
  content: string
  level: number
  type: 'unordered' | 'ordered'
  children?: ListItem[]
}

interface Section {
  type:
    | 'title'
    | 'subtitle'
    | 'text'
    | 'code'
    | 'list'
    | 'quote'
    | 'table'
    | 'divider'
  content: string
  level?: number
  language?: string
  listType?: 'unordered' | 'ordered'
  listItems?: ListItem[]
  dividerType?: 'dash' | 'star' | 'equal' | 'underscore'
}

// 复制到剪贴板的组件
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group/btn"
      title="复制代码"
    >
      {copied ? (
        <svg
          className="w-4 h-4 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  )
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  const [isClient, setIsClient] = useState(false)

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 在客户端重新高亮代码
  useEffect(() => {
    if (isClient) {
      Prism.highlightAll()
    }
  }, [content, isClient])

  // 服务端渲染时显示加载状态
  if (!isClient) {
    return (
      <div className={`markdown-renderer ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
      </div>
    )
  }

  // 通用的文本格式处理函数
  const processInlineFormats = (text: string): string => {
    return text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold text-purple-700 dark:text-purple-300">$1</strong>'
      )
      .replace(
        /\*(.*?)\*/g,
        '<em class="italic text-purple-600 dark:text-purple-400">$1</em>'
      )
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md text-sm font-mono shadow-sm">$1</code>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline decoration-purple-300 hover:decoration-purple-500 transition-all duration-200 font-medium" target="_blank" rel="noopener noreferrer">$1</a>'
      )
  }

  // 确定列表类型的函数
  const getListType = (listItems: string[]): 'unordered' | 'ordered' => {
    if (listItems.length === 0) return 'unordered'
    const firstItem = listItems[0].trim()
    return firstItem.match(/^\d+\./) ? 'ordered' : 'unordered'
  }

  // 获取列表项的缩进层级
  const getIndentLevel = (line: string): number => {
    const match = line.match(/^(\s*)/)
    return match ? Math.floor(match[1].length / 2) : 0
  }

  // 解析嵌套列表结构
  const parseNestedList = (listLines: string[]): ListItem[] => {
    const items: ListItem[] = []
    const stack: ListItem[] = []

    for (const line of listLines) {
      const level = getIndentLevel(line)
      const trimmedLine = line.trim()
      const isOrdered = /^\d+\./.test(trimmedLine)
      const content = trimmedLine
        .replace(/^[-*+]\s*/, '')
        .replace(/^\d+\.\s*/, '')

      const item: ListItem = {
        content,
        level,
        type: isOrdered ? 'ordered' : 'unordered',
        children: [],
      }

      // 处理嵌套逻辑
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        items.push(item)
      } else {
        const parent = stack[stack.length - 1]
        if (!parent.children) parent.children = []
        parent.children.push(item)
      }

      stack.push(item)
    }

    return items
  }

  // 解析 markdown 内容
  const parseMarkdown = (markdownContent: string): Section[] => {
    const lines = markdownContent.split('\n')
    const sections: Section[] = []

    let currentCodeBlock = ''
    let inCodeBlock = false
    let codeLanguage = ''
    let currentList: string[] = []
    let inList = false
    let currentTable: string[] = []
    let inTable = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 代码块处理
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          sections.push({
            type: 'code',
            content: currentCodeBlock.replace(/\n$/, ''),
            language: codeLanguage,
          })
          currentCodeBlock = ''
          inCodeBlock = false
          codeLanguage = ''
        } else {
          // 结束当前的列表或表格
          if (inList && currentList.length > 0) {
            sections.push({
              type: 'list',
              content: currentList.join('\n'),
              listType: getListType(currentList),
              listItems: parseNestedList(currentList),
            })
            currentList = []
            inList = false
          }
          if (inTable && currentTable.length > 0) {
            sections.push({ type: 'table', content: currentTable.join('\n') })
            currentTable = []
            inTable = false
          }
          inCodeBlock = true
          codeLanguage = line.replace('```', '').trim() || 'text'
        }
        continue
      }

      if (inCodeBlock) {
        currentCodeBlock += line + '\n'
        continue
      }

      // 表格处理
      if (line.includes('|') && line.trim().length > 0) {
        currentTable.push(line)
        inTable = true
        continue
      } else if (inTable && currentTable.length > 0) {
        sections.push({ type: 'table', content: currentTable.join('\n') })
        currentTable = []
        inTable = false
      }

      // 分割线处理
      if (line.match(/^-{3,}$|^={3,}$|^\*{3,}$|^_{3,}$/)) {
        if (inList && currentList.length > 0) {
          sections.push({
            type: 'list',
            content: currentList.join('\n'),
            listType: getListType(currentList),
            listItems: parseNestedList(currentList),
          })
          currentList = []
          inList = false
        }

        // 确定分割线类型
        let dividerType: 'dash' | 'star' | 'equal' | 'underscore' = 'dash'
        if (line.match(/^-{3,}$/)) dividerType = 'dash'
        else if (line.match(/^\*{3,}$/)) dividerType = 'star'
        else if (line.match(/^={3,}$/)) dividerType = 'equal'
        else if (line.match(/^_{3,}$/)) dividerType = 'underscore'

        sections.push({ type: 'divider', content: '', dividerType })
        continue
      }

      // 标题处理
      if (line.startsWith('#')) {
        if (inList && currentList.length > 0) {
          sections.push({
            type: 'list',
            content: currentList.join('\n'),
            listType: getListType(currentList),
            listItems: parseNestedList(currentList),
          })
          currentList = []
          inList = false
        }
        const level = line.match(/^#+/)?.[0].length || 1
        const title = line.replace(/^#+\s*/, '').replace(/\s*​$/, '')
        sections.push({
          type: level === 1 ? 'title' : 'subtitle',
          content: title,
          level,
        })
        continue
      }

      // 引用处理
      if (line.startsWith('>')) {
        if (inList && currentList.length > 0) {
          sections.push({
            type: 'list',
            content: currentList.join('\n'),
            listType: getListType(currentList),
            listItems: parseNestedList(currentList),
          })
          currentList = []
          inList = false
        }
        // 累积引用块内容，支持多行引用
        let quoteContent = line.replace(/^>\s*/, '')
        let nextIndex = i + 1

        // 检查后续行是否也是引用
        while (nextIndex < lines.length && lines[nextIndex].startsWith('>')) {
          quoteContent += '\n' + lines[nextIndex].replace(/^>\s*/, '')
          nextIndex++
        }

        sections.push({ type: 'quote', content: quoteContent })
        i = nextIndex - 1 // 跳过已处理的行
        continue
      }

      // 列表处理
      if (line.match(/^(\s*)[-*+]\s/) || line.match(/^(\s*)\d+\.\s/)) {
        currentList.push(line)
        inList = true
        continue
      }

      // 列表续行处理 (缩进的行，但不是列表项)
      if (
        inList &&
        line.match(/^\s+\S/) &&
        !line.match(/^(\s*)[-*+]\s/) &&
        !line.match(/^(\s*)\d+\.\s/)
      ) {
        currentList[currentList.length - 1] += '\n' + line
        continue
      }

      // 普通文本
      if (line.trim()) {
        if (inList && currentList.length > 0) {
          sections.push({
            type: 'list',
            content: currentList.join('\n'),
            listType: getListType(currentList),
            listItems: parseNestedList(currentList),
          })
          currentList = []
          inList = false
        }
        sections.push({ type: 'text', content: line })
      }
    }

    // 处理最后的内容
    if (inList && currentList.length > 0) {
      sections.push({
        type: 'list',
        content: currentList.join('\n'),
        listType: getListType(currentList),
        listItems: parseNestedList(currentList),
      })
    }
    if (inTable && currentTable.length > 0) {
      sections.push({ type: 'table', content: currentTable.join('\n') })
    }

    return sections
  }

  // 渲染嵌套列表项的函数
  const renderListItems = (
    items: ListItem[],
    level: number = 0
  ): React.JSX.Element[] => {
    return items.map((item, index) => {
      const processedContent = processInlineFormats(item.content)
      const hasChildren = item.children && item.children.length > 0
      const isOrdered = item.type === 'ordered'
      const isLastItem = index === items.length - 1

      return (
        <li
          key={index}
          className={`relative ${
            isOrdered ? 'pl-0' : 'flex items-start gap-3'
          }`}
        >
          {!isOrdered && (
            <>
              {/* 层级指示线 */}
              {level > 0 && (
                <div
                  className={`absolute -left-4 top-0 w-px bg-gradient-to-b from-purple-300/50 to-blue-300/50 ${
                    isLastItem && !hasChildren ? 'h-6' : 'bottom-0'
                  }`}
                ></div>
              )}
              {/* 水平连接线 */}
              {level > 0 && (
                <div className="absolute -left-4 top-2 w-4 h-px bg-gradient-to-r from-purple-300/50 to-blue-300/50"></div>
              )}
              <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full block mt-2 flex-shrink-0 relative z-10 shadow-sm"></span>
            </>
          )}
          <div
            className={`${isOrdered ? '' : 'flex-1'} ${
              level > 0 && !isOrdered ? 'pl-1' : ''
            }`}
          >
            <span
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: processedContent,
              }}
            />
            {hasChildren && (
              <div className={`mt-3 ${isOrdered ? 'ml-6' : 'ml-4'} relative`}>
                {item.children![0].type === 'ordered' ? (
                  <ol className="space-y-3 list-none counter-reset-ordered">
                    {item.children!.map((child, childIndex) => (
                      <li
                        key={childIndex}
                        className="relative flex items-start gap-3 counter-increment-ordered"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                          {childIndex + 1}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <span
                            className="text-gray-700 dark:text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: processInlineFormats(child.content),
                            }}
                          />
                          {child.children && child.children.length > 0 && (
                            <div className="mt-3 ml-4">
                              {child.children[0].type === 'ordered' ? (
                                <ol className="space-y-2 list-none">
                                  {renderListItems(child.children, level + 2)}
                                </ol>
                              ) : (
                                <ul className="space-y-2">
                                  {renderListItems(child.children, level + 2)}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="space-y-3">
                    {renderListItems(item.children!, level + 1)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </li>
      )
    })
  }

  const sections = parseMarkdown(content)

  return (
    <div className={`markdown-renderer space-y-8 ${className}`}>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'title':
            return (
              <div key={index} className="relative">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 mb-6 pb-4 relative">
                  {section.content}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/30 via-blue-500/50 to-purple-500/30 rounded-full"></div>
                </h1>
              </div>
            )

          case 'subtitle':
            const HeadingTag =
              section.level === 2
                ? 'h2'
                : section.level === 3
                ? 'h3'
                : section.level === 4
                ? 'h4'
                : section.level === 5
                ? 'h5'
                : 'h6'
            const headingSize =
              section.level === 2
                ? 'text-3xl'
                : section.level === 3
                ? 'text-2xl'
                : section.level === 4
                ? 'text-xl'
                : section.level === 5
                ? 'text-lg'
                : 'text-base'

            return (
              <HeadingTag
                key={index}
                className={`${headingSize} font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mt-12 mb-6 flex items-center gap-3`}
              >
                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
                {section.content}
              </HeadingTag>
            )

          case 'quote':
            return (
              <div key={index} className="relative my-8">
                <blockquote className="relative backdrop-blur-md bg-white/10 dark:bg-gray-800/20 border border-white/20 dark:border-gray-700/30 rounded-xl p-6 shadow-lg">
                  {/* 顶部玻璃装饰线 */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                  <div className="flex items-start gap-4">
                    <div className="text-purple-400/50 text-3xl font-serif leading-none">
                      "
                    </div>
                    <div className="flex-1 italic text-purple-700 dark:text-purple-300 text-lg leading-relaxed">
                      <MarkdownRenderer
                        content={section.content}
                        className="space-y-4"
                      />
                    </div>
                  </div>

                  <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-purple-500/60 to-blue-500/60 rounded-full"></div>
                </blockquote>
              </div>
            )

          case 'code':
            const languageKey =
              section.language?.toLowerCase() === 'dockerfile'
                ? 'docker'
                : section.language?.toLowerCase() || 'text'
            // 保留原始代码格式，只去掉末尾的换行符
            const originalContent = section.content.replace(/\n$/, '')
            const codeLines = originalContent.split('\n')

            return (
              <div key={index} className="my-8 group">
                <div className="code-container">
                  {/* 复制按钮 */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <CopyButton text={originalContent} />
                  </div>

                  {/* 代码区域 */}
                  <div className="code-scroll">
                    <div className="flex min-w-max">
                      {/* 行号 */}
                      <div className="line-numbers flex-shrink-0 py-4 px-4 min-w-[3.5rem]">
                        {codeLines.map((_, index) => (
                          <div
                            key={index}
                            className="h-6 leading-6 text-right whitespace-nowrap"
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>

                      {/* 代码内容 */}
                      <div className="flex-1 py-4 px-4 min-w-0">
                        <pre className="code-content text-sm leading-6 whitespace-pre overflow-x-auto">
                          {codeLines.map((line, index) => (
                            <div
                              key={index}
                              className="code-line h-6 leading-6 font-mono"
                              style={{ whiteSpace: 'pre', tabSize: 4 }}
                            >
                              <code
                                className={`language-${languageKey}`}
                                style={{ whiteSpace: 'pre', tabSize: 4 }}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    line.trim().length === 0
                                      ? '\u00A0' // 使用 Unicode 不间断空格，避免 hydration 问题
                                      : Prism.highlight(
                                          line,
                                          Prism.languages[languageKey] ||
                                            Prism.languages.text,
                                          languageKey
                                        ),
                                }}
                              />
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )

          case 'list':
            if (!section.listItems || section.listItems.length === 0) {
              return null
            }

            // 确定根级别列表的类型
            const rootListType = section.listItems[0].type
            const ListTag = rootListType === 'ordered' ? 'ol' : 'ul'

            return (
              <div key={index} className="my-6">
                {rootListType === 'ordered' ? (
                  <ol className="space-y-3 list-none">
                    {section.listItems.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="relative flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                          {itemIndex + 1}
                        </span>
                        <div className="flex-1 pt-0.5">
                          <span
                            className="text-gray-700 dark:text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: processInlineFormats(item.content),
                            }}
                          />
                          {item.children && item.children.length > 0 && (
                            <div className="mt-3 ml-4">
                              {item.children[0].type === 'ordered' ? (
                                <ol className="space-y-3 list-none">
                                  {item.children.map((child, childIndex) => (
                                    <li
                                      key={childIndex}
                                      className="relative flex items-start gap-3"
                                    >
                                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                                        {childIndex + 1}
                                      </span>
                                      <div className="flex-1 pt-0.5">
                                        <span
                                          className="text-gray-700 dark:text-gray-300 leading-relaxed"
                                          dangerouslySetInnerHTML={{
                                            __html: processInlineFormats(
                                              child.content
                                            ),
                                          }}
                                        />
                                      </div>
                                    </li>
                                  ))}
                                </ol>
                              ) : (
                                <ul className="space-y-3">
                                  {renderListItems(item.children, 1)}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ListTag className="space-y-3">
                    {renderListItems(section.listItems)}
                  </ListTag>
                )}
              </div>
            )

          case 'table':
            const tableLines = section.content
              .split('\n')
              .filter(line => line.trim())
            const headers = tableLines[0]
              ?.split('|')
              .map(h => h.trim())
              .filter(h => h)
            const rows = tableLines.slice(2).map(line =>
              line
                .split('|')
                .map(cell => cell.trim())
                .filter(cell => cell)
            )

            return (
              <div key={index} className="my-8">
                <div className="relative backdrop-blur-md bg-white/10 dark:bg-gray-800/20 rounded-xl border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden">
                  {/* 顶部玻璃装饰线 */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      {headers && (
                        <thead>
                          <tr className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                            {headers.map((header, headerIndex) => (
                              <th
                                key={headerIndex}
                                className="px-6 py-4 text-left font-bold text-purple-700 dark:text-purple-300 border-b border-white/20 dark:border-gray-700/30"
                                dangerouslySetInnerHTML={{
                                  __html: processInlineFormats(header),
                                }}
                              />
                            ))}
                          </tr>
                        </thead>
                      )}
                      <tbody>
                        {rows.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="border-b border-white/10 dark:border-gray-700/20 last:border-b-0"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 text-gray-700 dark:text-gray-300"
                                dangerouslySetInnerHTML={{
                                  __html: processInlineFormats(cell),
                                }}
                              />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 底部玻璃装饰线 */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              </div>
            )

          case 'divider':
            const dividerType = section.dividerType || 'dash'

            // 根据分割线类型渲染不同样式
            switch (dividerType) {
              case 'dash':
                return (
                  <div
                    key={index}
                    className="my-16 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-4 w-full max-w-md">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-blue-300"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-purple-300 to-transparent"></div>
                    </div>
                  </div>
                )

              case 'star':
                return (
                  <div
                    key={index}
                    className="my-16 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rotate-45 shadow-sm"
                        ></div>
                      ))}
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                    </div>
                  </div>
                )

              case 'equal':
                return (
                  <div
                    key={index}
                    className="my-16 flex items-center justify-center"
                  >
                    <div className="w-full max-w-md space-y-2">
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-400 via-blue-400 to-transparent"></div>
                      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 via-purple-400 to-transparent"></div>
                    </div>
                  </div>
                )

              case 'underscore':
                return (
                  <div
                    key={index}
                    className="my-16 flex items-center justify-center"
                  >
                    <div className="w-full max-w-md">
                      <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 via-blue-500 to-transparent rounded-full shadow-sm"></div>
                    </div>
                  </div>
                )

              default:
                return (
                  <div
                    key={index}
                    className="my-16 flex items-center justify-center"
                  >
                    <div className="flex items-center gap-4 w-full max-w-md">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-300 to-blue-300"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg"></div>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-purple-300 to-transparent"></div>
                    </div>
                  </div>
                )
            }

          case 'text':
            // 处理粗体、斜体、行内代码、链接
            const processedText = processInlineFormats(section.content)

            return (
              <p
                key={index}
                className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: processedText }}
              />
            )

          default:
            return null
        }
      })}
    </div>
  )
}
