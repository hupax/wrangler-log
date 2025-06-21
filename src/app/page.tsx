'use client'
import { useState, useRef, useEffect } from 'react'
import {
  UploadIcon,
  ToolsIcon,
  MicIcon,
  VoiceModeIcon,
} from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useNotesStore } from '@/lib/store'

export default function Home() {
  const [content, setContent] = useState('')
  const [hasInteracted, setHasInteracted] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { addNote } = useNotesStore()

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const text = contentEditableRef.current.textContent || ''
      setContent(text)

      // 自动调整高度
      contentEditableRef.current.style.height = 'auto'
      contentEditableRef.current.style.height =
        contentEditableRef.current.scrollHeight + 'px'

      contentEditableRef.current.style.height === '24px'
        ? setHasInteracted(true)
        : setHasInteracted(false)
    }
  }

  const handleGenerateNote = async () => {
    if (!content || isGenerating) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: content,
        }),
      })

      const data = await response.json()
      if (data.success) {
        addNote({
          id: data.noteId,
          title: data.title,
          content: data.content,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          prompt: content,
        })
        router.push(`/notes/${data.noteId}`)
      }
    } catch (error) {
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

      {/* 输入区域 */}
      <div className="composer-container">
        <div className="composer-form">
          <div className="input-wrapper">
            {/* 输入框 */}
            <div className="input-container">
              <div className="input-content">
                {!hasInteracted ||
                  (!content && (
                    <div className="placeholder">Note anything</div>
                  ))}
                <div
                  ref={contentEditableRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="editable-input"
                  onInput={handleContentChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleGenerateNote()
                    }
                  }}
                  // data-virtualkeyboard="true"
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
                <button
                  type="button"
                  className="voice-mode-button"
                  aria-label="Start voice mode"
                >
                  <VoiceModeIcon className="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
