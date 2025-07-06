'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useNotesStore } from '@/lib/store'
import { useStreamingNote } from '@/hooks/useStreamingNote'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import {
  UploadIcon,
  ToolsIcon,
  MicIcon,
  VoiceModeIcon,
  SendIcon,
} from '@/components/icons'

export default function StreamingNotePage() {
  const [inputContent, setInputContent] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, addNote } = useNotesStore()
  const { content, isGenerating, error, isComplete, generateNote, reset } =
    useStreamingNote()

  // 自动滚动到内容底部
  useEffect(() => {
    if (contentEndRef.current && content) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [content])

  // 自动调整textarea高度
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
  }, [inputContent])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value)
  }

  const handleGenerateNote = async () => {
    if (!inputContent.trim() || isGenerating || !user) return

    await generateNote(inputContent, user.uid)
  }

  const handleSaveNote = async () => {
    if (!content.trim() || !user) return

    try {
      // 生成标题（简单从内容中提取）
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
      } else {
        throw new Error(data.error || 'Failed to save note')
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  const handleNewNote = () => {
    reset()
    setInputContent('')
  }

  // 如果正在生成或已完成，显示生成界面
  if (isGenerating || content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 顶部操作栏 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleNewNote}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                ← 新建笔记
              </button>
              {isGenerating && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    正在生成...
                  </span>
                </div>
              )}
            </div>

            {isComplete && (
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                保存笔记
              </button>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 原始输入 */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              原始输入
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {inputContent}
            </p>
          </div>

          {/* 生成的内容 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                生成的笔记
              </h2>
              {isGenerating && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">实时生成中</span>
                </div>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none">
              {content ? (
                <div>
                  <MarkdownRenderer content={content} />
                  {/* 简单的光标效果 */}
                  {isGenerating && (
                    <span className="inline-block w-0.5 h-5 bg-gray-800 dark:bg-gray-200 ml-1 animate-pulse"></span>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  等待内容生成...
                </div>
              )}
            </div>
            <div ref={contentEndRef} />
          </div>
        </div>
      </div>
    )
  }

  // 初始输入界面
  return (
    <div className="home-container">
      <h1 className="home-title">流式笔记生成</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        体验真正的流式笔记生成
      </p>

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
                  placeholder="输入任何内容，AI 将实时为你生成结构化笔记..."
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
                    aria-label="Generate note"
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
