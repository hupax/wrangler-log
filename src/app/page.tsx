'use client'
import { useState, useRef, useEffect } from 'react'
import {
  UploadIcon,
  ToolsIcon,
  MicIcon,
  VoiceModeIcon,
  SendIcon,
} from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function Home() {
  const [input, setInput] = useState('')
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isComposing, setIsComposing] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useAuthStore()
  const { addNote } = useNotesStore()

  // 只在正在生成时自动滚动到底部，生成完成后不自动滚动
  useEffect(() => {
    if (contentEndRef.current && content && isGenerating) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [content, isGenerating])

  // 生成笔记
  const generateNote = async () => {
    if (!input.trim() || !user || isGenerating) return

    setIsGenerating(true)
    setError('')
    setContent('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, userId: user.uid }),
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = (await reader?.read()) || { done: true }
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'content') {
                setContent(prev => prev + data.content)
              } else if (data.type === 'complete') {
                // 添加到本地存储
                addNote({
                  id: data.noteId,
                  userId: user.uid,
                  title: data.title,
                  content: data.content,
                  prompt: input,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })

                // 跳转到笔记页面
                router.push(`/notes/${data.noteId}`)
                return
              } else if (data.type === 'error') {
                setError(data.error)
                break
              }
            } catch (e) {
              console.error('解析错误:', e)
            }
          }
        }
      }
    } catch (err) {
      setError('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 365

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = maxHeight + 'px'
        textareaRef.current.style.overflowY = 'auto'
      } else {
        textareaRef.current.style.height = scrollHeight + 'px'
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }

  // 重置
  const handleReset = () => {
    setInput('')
    setContent('')
    setError('')
    setIsGenerating(false)
  }

  // 如果正在生成或有内容，显示生成界面
  if (isGenerating || content) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              ← 返回
            </button>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {isGenerating ? '正在生成中...' : '生成完成'}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            {content ? (
              <MarkdownRenderer content={content} />
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div ref={contentEndRef} />
        </div>
      </div>
    )
  }

  // 初始输入界面
  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-normal text-center mb-8">
          What's on your mind today?
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="composer-container">
          <div className="composer-form">
            <div className="input-wrapper">
              <div className="input-container">
                <div className="input-content">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                        if (input.trim()) {
                          e.preventDefault()
                          generateNote()
                        } else {
                          e.preventDefault()
                        }
                      }
                    }}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder="Note anything"
                    className="editable-input"
                    rows={1}
                    style={{
                      resize: 'none',
                      minHeight: '24px',
                    }}
                  />
                </div>
              </div>

              <div className="button-area">
                <div className="left-buttons">
                  <button
                    type="button"
                    className="action-button"
                    aria-label="Add photos and files"
                  >
                    <UploadIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="tools-button"
                    aria-label="Choose tool"
                  >
                    <ToolsIcon className="w-5 h-5" />
                    <span className="tools-text">Tools</span>
                  </button>
                </div>

                <div className="right-buttons">
                  <button
                    type="button"
                    className="action-button"
                    aria-label="Dictate button"
                  >
                    <MicIcon className="w-5 h-5" />
                  </button>
                  {input.trim() ? (
                    <button
                      onClick={generateNote}
                      disabled={isGenerating}
                      className="flex items-center justify-center rounded-full transition-colors hover:opacity-70 disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:focus-visible:outline-white bg-black text-white disabled:bg-[#D7D7D7] dark:bg-white dark:text-black h-9 w-9"
                    >
                      <SendIcon className="icon" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="voice-mode-button"
                      aria-label="Start voice mode"
                    >
                      <VoiceModeIcon className="icon" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
