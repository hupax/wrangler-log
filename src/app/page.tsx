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

  // 简洁的加载页面
  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="relative">
          {/* 呼吸圆形动画 */}
          <div className="w-16 h-16 bg-black rounded-full animate-pulse"></div>

          {/* 外圈呼吸效果 */}
          <div className="absolute inset-0 w-16 h-16 bg-black rounded-full opacity-20 animate-ping"></div>
        </div>
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
                  (!content && <div className="placeholder">Note anything</div>)}
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
