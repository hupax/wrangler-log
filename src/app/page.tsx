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
import LoginButton from '@/components/auth/LoginButton'

export default function Home() {
  const [content, setContent] = useState('')
  const [hasInteracted, setHasInteracted] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isComposing, setIsComposing] = useState(false) // 输入法组合状态
  const contentEditableRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { addNote, user, isAuthenticated, isLoading } = useNotesStore()

  // 输入框内容变化
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      // 获取纯文本内容，去除任何HTML标签
      const text = contentEditableRef.current.textContent || ''

      // 如果内容包含HTML标签，清理它们
      if (contentEditableRef.current.innerHTML !== text) {
        contentEditableRef.current.textContent = text
      }

      setContent(text)
      setError('') // 清除错误信息

      // 自动调整高度
      contentEditableRef.current.style.height = 'auto'
      contentEditableRef.current.style.height =
        contentEditableRef.current.scrollHeight + 'px'

      // 使用实时的 text 值而不是 state 中的 content
      const isEmpty = !text.trim()
      const currentHeight = contentEditableRef.current.style.height

      currentHeight === '24px'
        ? setHasInteracted(true)
        : setHasInteracted(false)

        console.log(!content.trim(), 'content');
        console.log(hasInteracted, 'hasInteracted');
        

    }
  }

  // 创建笔记
  const handleGenerateNote = async () => {
    if (!content || isGenerating || !user) return

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
                {!(content.trim()) && <div className="placeholder">Note anything</div>}
                <div
                  ref={contentEditableRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="editable-input"
                  onInput={handleContentChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                      e.preventDefault()
                      handleGenerateNote()
                    }
                  }}
                  onCompositionStart={() => {
                    setIsComposing(true)
                  }}
                  onCompositionEnd={() => {
                    setIsComposing(false)
                  }}
                  onPaste={e => {
                    // 阻止默认粘贴行为
                    e.preventDefault()

                    // 获取纯文本内容
                    const text = e.clipboardData?.getData('text/plain') || ''

                    // 插入纯文本
                    if (text && contentEditableRef.current) {
                      // 获取当前光标位置
                      const selection = window.getSelection()

                      if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0)

                        // 删除选中的内容
                        range.deleteContents()

                        // 插入纯文本
                        const textNode = document.createTextNode(text)
                        range.insertNode(textNode)

                        // 将光标移动到插入文本的末尾
                        range.setStartAfter(textNode)
                        range.setEndAfter(textNode)
                        range.collapse(true)

                        // 清除所有选择并重新设置
                        selection.removeAllRanges()
                        selection.addRange(range)
                      } else {
                        // 如果没有选择范围，直接设置文本内容并将光标移到末尾
                        const currentText =
                          contentEditableRef.current.textContent || ''
                        contentEditableRef.current.textContent =
                          currentText + text

                        // 将光标移动到末尾
                        const newRange = document.createRange()
                        const sel = window.getSelection()

                        newRange.selectNodeContents(contentEditableRef.current)
                        newRange.collapse(false) // 移动到末尾

                        sel?.removeAllRanges()
                        sel?.addRange(newRange)
                      }

                      // 触发内容变化处理
                      handleContentChange()
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
                {content.trim() ? (
                  <button
                    id="composer-submit-button"
                    aria-label="Send prompt"
                    data-testid="send-button"
                    className="dark:disabled:bg-token-text-quaternary dark:disabled:text-token-main-surface-secondary flex items-center justify-center rounded-full transition-colors hover:opacity-70 disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:focus-visible:outline-white bg-black text-white disabled:bg-[#D7D7D7] dark:bg-white dark:text-black h-9 w-9"
                    onClick={handleGenerateNote}
                    disabled={isGenerating || !content}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon"
                    >
                      <path d="M8.99992 16V6.41407L5.70696 9.70704C5.31643 10.0976 4.68342 10.0976 4.29289 9.70704C3.90237 9.31652 3.90237 8.6835 4.29289 8.29298L9.29289 3.29298L9.36907 3.22462C9.76184 2.90427 10.3408 2.92686 10.707 3.29298L15.707 8.29298L15.7753 8.36915C16.0957 8.76192 16.0731 9.34092 15.707 9.70704C15.3408 10.0732 14.7618 10.0958 14.3691 9.7754L14.2929 9.70704L10.9999 6.41407V16C10.9999 16.5523 10.5522 17 9.99992 17C9.44764 17 8.99992 16.5523 8.99992 16Z"></path>
                    </svg>
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
