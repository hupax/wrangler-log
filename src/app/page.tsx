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
import { useNotesStore } from '@/lib/store'
import LoginButton from '@/components/auth/LoginButton'

export default function Home() {
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isComposing, setIsComposing] = useState(false) // 输入法组合状态
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const { addNote, user, isAuthenticated, isLoading } = useNotesStore()

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
    setContent(text)
    setError('') // 清除错误信息

    // 自动调整高度
    if (textareaRef.current) {
      const maxHeight = 365 // 最大高度，与CSS中的max-height保持一致

      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight

      if (scrollHeight > maxHeight) {
        // 超过最大高度时，固定高度并显示滚动条
        textareaRef.current.style.height = maxHeight + 'px'
        textareaRef.current.style.overflowY = 'auto'
      } else {
        // 未超过最大高度时，自动调整高度并隐藏滚动条
        textareaRef.current.style.height = scrollHeight + 'px'
        textareaRef.current.style.overflowY = 'hidden'
      }
    }
  }

  // 创建笔记
  const handleGenerateNote = async () => {
    if (!content.trim() || isGenerating || !user) return

    setIsGenerating(true)
    setError('')

    try {
      console.log('Creating note with userId:', user.uid)

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
          userId: user.uid,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        addNote({
          id: data.noteId,
          userId: data.userId,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          prompt: content,
        })
        router.push(`/notes/${data.noteId}`)
      } else {
        throw new Error(data.error || 'Failed to create note')
      }
    } catch (error: any) {
      console.error('Failed to generate note:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // OpenAI 风格加载页面
  if (isGenerating) {
    return (
      <div className="home-container">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 w-8 h-8 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* 加载文字 */}
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
          Generating your note...
        </p>
      </div>
    )
  }

  return (
    <div className="home-container">
      {/* 标题 */}
      <h1 className="home-title">What's on your mind today?</h1>

      {/* 错误信息 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 输入区域 */}
      <div className="composer-container">
        <div className="composer-form">
          <div className="input-wrapper">
            {/* 输入框 */}
            <div className="input-container">
              <div className="input-content">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                      // 检查内容是否为空或只包含空白字符
                      if (content.trim()) {
                        e.preventDefault()
                        handleGenerateNote()
                      } else {
                        // 内容为空时阻止换行
                        e.preventDefault()
                      }
                    }
                  }}
                  onCompositionStart={() => {
                    setIsComposing(true)
                  }}
                  onCompositionEnd={() => {
                    setIsComposing(false)
                  }}
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

            {/* 按钮区域 */}
            <div className="button-area">
              {/* 左侧按钮 */}
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

              {/* 右侧按钮 */}
              <div className="right-buttons">
                <button
                  type="button"
                  className="action-button"
                  aria-label="Dictate button"
                >
                  <MicIcon className="w-5 h-5" />
                </button>
                {content.trim() ? (
                  <button
                    id="composer-submit-button"
                    aria-label="Send prompt"
                    data-testid="send-button"
                    className="flex items-center justify-center rounded-full transition-colors hover:opacity-70 disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:focus-visible:outline-white bg-black text-white disabled:bg-[#D7D7D7] dark:bg-white dark:text-black h-9 w-9"
                    onClick={handleGenerateNote}
                    disabled={isGenerating || !content.trim()}
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
  )
}
