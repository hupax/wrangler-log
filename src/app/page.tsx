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
import { useStreamingNote } from '@/hooks/useStreamingNote'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default function Home() {
  const {
    content,
    isGenerating,
    error: streamError,
    isComplete,
    generateNote,
    reset,
  } = useStreamingNote()

  const [error, setError] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [inputContent, setInputContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { addNote } = useNotesStore()

  // 自动滚动到内容底部（只在用户没有手动滚动时）
  const [userScrolled, setUserScrolled] = useState(false)

  useEffect(() => {
    if (contentEndRef.current && content && !userScrolled) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [content, userScrolled])

  // 监听用户滚动
  useEffect(() => {
    const handleScroll = () => {
      // 获取主内容区域的滚动容器
      const mainElement = document.querySelector('main')
      if (!mainElement) return

      const scrollTop = mainElement.scrollTop
      const scrollHeight = mainElement.scrollHeight
      const clientHeight = mainElement.clientHeight

      // 如果用户滚动到了非底部位置，标记为用户已滚动
      if (scrollTop + clientHeight < scrollHeight - 100) {
        setUserScrolled(true)
      } else {
        setUserScrolled(false)
      }
    }

    // 监听主内容区域的滚动事件
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll)
      return () => mainElement.removeEventListener('scroll', handleScroll)
    }
  }, [isGenerating, content]) // 添加依赖，确保在内容变化时重新绑定

  // 初始化时设置textarea高度
  useEffect(() => {
    if (textareaRef.current) {
      const maxHeight = 365
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = maxHeight + 'px'
        textareaRef.current.style.overflowY = 'auto'
      } else {
        textareaRef.current.style.height = scrollHeight + 'px'
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }, [])

  // 输入框内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setInputContent(text)
    setError('')

    // 自动调整高度
    if (textareaRef.current) {
      const maxHeight = 365

      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = maxHeight + 'px'
        textareaRef.current.style.overflowY = 'auto'
      } else {
        textareaRef.current.style.height = scrollHeight + 'px'
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }

  // 创建笔记
  const handleGenerateNote = async () => {
    if (!inputContent.trim() || isGenerating || !user) return

    reset()
    await generateNote(inputContent, user.uid)
  }

  const handleSaveNote = async () => {
    if (!content.trim() || !user || !isComplete) return

    try {
      const title =
        content
          .split('\n')[0]
          .replace(/^#+\s*/, '')
          .trim() || '新建笔记'

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          userId: user.uid,
          prompt: inputContent,
          isStreamGenerated: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        addNote({
          id: data.noteId,
          userId: data.userId,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          prompt: inputContent,
        })
        router.push(`/notes/${data.noteId}`)
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleNewNote = () => {
    reset()
    setInputContent('')
    setUserScrolled(false) // 重置滚动状态
  }

  // 如果正在生成或已完成，只显示笔记内容
  if (isGenerating || content) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto">
          {/* 顶部简单操作栏 */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={handleNewNote}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
            >
              ← 返回
            </button>
            {isComplete && (
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                保存笔记
              </button>
            )}
          </div>

          {/* 只显示笔记内容 */}
          <div className="prose dark:prose-invert max-w-none">
            {content ? (
              <div>
                <MarkdownRenderer content={content} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative mb-4">
                  <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute inset-0 w-8 h-8 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
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

        {(error || streamError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error || streamError}
          </div>
        )}

        <div className="composer-container">
          <div className="composer-form">
            <div className="input-wrapper">
              <div className="input-container">
                <div className="input-content">
                  <textarea
                    ref={textareaRef}
                    value={inputContent}
                    onChange={handleContentChange}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                        if (inputContent.trim()) {
                          e.preventDefault()
                          handleGenerateNote()
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
                  {inputContent.trim() ? (
                    <button
                      onClick={handleGenerateNote}
                      disabled={isGenerating || !inputContent.trim()}
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
