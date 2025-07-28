'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useNotesStore } from '@/stores/notes'
import { useAuthStore } from '@/stores/auth'
import { useScrollLock } from '@/hooks/useScrollLock'
import {
  ShareIcon,
  RenameIcon,
  ArchiveIcon,
  DeleteIcon,
} from '@/components/icons'

interface NoteOptionsMenuProps {
  noteId: string
  noteTitle: string
  isOpen: boolean
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

// 删除确认对话框组件
function DeleteConfirmDialog({
  isOpen,
  noteTitle,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  noteTitle: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // 使用滚动锁定hook
  useScrollLock({ isLocked: isOpen })

  // ESC键关闭对话框
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={e => {
        // 点击背景遮罩关闭对话框
        if (e.target === e.currentTarget) {
          onCancel()
        }
      }}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30" />

      {/* 对话框 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-[0_16px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_70px_rgba(0,0,0,0.3)] flex flex-col w-full max-w-md overflow-hidden"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        {/* 内容 */}
        <div className="px-7 py-5">
          <h2
            id="delete-dialog-title"
            className="text-xl font-normal text-gray-900 dark:text-gray-100 mb-4"
          >
            Delete note?
          </h2>

          <p
            id="delete-dialog-description"
            className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed mb-6"
          >
            This will delete{' '}
            <strong className="font-medium text-gray-900 dark:text-gray-100">
              {noteTitle}
            </strong>
            .
          </p>

          {/* 按钮组 */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-full transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-sm text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NoteOptionsMenu({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  buttonRef,
}: NoteOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { deleteNote } = useNotesStore()
  const { user } = useAuthStore()
  const router = useRouter()
  const params = useParams()
  const currentNoteId = params.id as string | undefined
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // 计算菜单位置
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 200 // 菜单宽度
      const menuHeight = 200 // 估算菜单高度

      let x = buttonRect.left
      let y = buttonRect.bottom + 4

      // 如果菜单会超出右边界，向左调整
      if (x + menuWidth > window.innerWidth) {
        x = buttonRect.right - menuWidth
      }

      // 如果菜单会超出底部边界，向上调整
      if (y + menuHeight > window.innerHeight) {
        y = buttonRect.top - menuHeight - 4
      }

      setMenuPosition({ x, y })
    }
  }, [isOpen, buttonRef])

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleShare = () => {
    console.log('Share note:', noteTitle)
    // TODO: 实现分享功能
    onClose()
  }

  const handleRename = () => {
    console.log('Rename note:', noteTitle)
    // TODO: 实现重命名功能
    onClose()
  }

  const handleArchive = async () => {
    if (!user?.uid) {
      console.error('User not authenticated')
      return
    }

    setIsArchiving(true)

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          userId: user.uid,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Note archived to GitHub:', result.githubUrl)
        // 可以添加成功通知
        alert(
          `✅ Note "${noteTitle}" successfully archived to GitHub!\n\nView at: ${result.githubUrl}`
        )
      } else {
        console.error('❌ Failed to archive note:', result.error)
        alert(`❌ Failed to archive note: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Archive error:', error)
      alert(
        `❌ Archive error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsArchiving(false)
      onClose()
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
    // 不立即关闭选项菜单，等删除对话框关闭后再关闭
  }

  const handleDeleteConfirm = async () => {
    if (!user?.uid) {
      console.error('User not authenticated')
      setShowDeleteDialog(false)
      onClose() // 关闭选项菜单
      return
    }

    try {
      const response = await fetch(
        `/api/notes?noteId=${noteId}&userId=${user.uid}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        }
      )

      if (response.ok) {
        deleteNote(noteId)
        console.log('Note deleted successfully')

        // 如果删除的是当前打开的笔记，跳转到首页
        if (currentNoteId === noteId) {
          router.push('/')
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to delete note:', errorData.error)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }

    setShowDeleteDialog(false)
    onClose() // 关闭选项菜单
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
    onClose() // 关闭选项菜单
  }

  if (!isOpen) return null

  return (
    <>
      {/* 选项菜单 - 只在删除对话框未显示时显示 */}
      {!showDeleteDialog && (
        <div
          className="fixed z-50"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            minWidth: 'max-content',
          }}
        >
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            className="z-50 max-w-xs rounded-2xl bg-white dark:bg-[#353535] shadow-xl border border-gray-200 dark:border-gray-600 py-1.5 min-w-[130px] max-h-[95vh] overflow-y-auto select-none animate-slideUpAndFade"
            tabIndex={-1}
          >
            <div className="flex flex-col">
              {/* 分享 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={handleShare}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <ShareIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Share
                  </span>
                </div>
              </div>

              {/* 重命名 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={handleRename}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <RenameIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Rename
                  </span>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="bg-gray-200 dark:bg-gray-600 h-px mx-4 my-1"></div>

              {/* 归档 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-colors ${
                    isArchiving
                      ? 'bg-blue-50 dark:bg-blue-900/20 cursor-wait'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  onClick={isArchiving ? undefined : handleArchive}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    {isArchiving ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArchiveIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {isArchiving ? 'Archiving...' : 'Archive'}
                  </span>
                </div>
              </div>

              {/* 删除 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-600/20 cursor-pointer transition-colors"
                  onClick={handleDeleteClick}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-red-600 dark:text-red-400">
                    <DeleteIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Delete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        noteTitle={noteTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
