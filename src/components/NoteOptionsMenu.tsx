'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotesStore } from '@/stores/notes'
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

export default function NoteOptionsMenu({
  noteId,
  noteTitle,
  isOpen,
  onClose,
  buttonRef,
}: NoteOptionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const { deleteNote } = useNotesStore()
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

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

  const handleArchive = () => {
    console.log('Archive note:', noteTitle)
    // TODO: 实现归档功能
    onClose()
  }

  const handleDelete = async () => {
    if (window.confirm(`确定要删除笔记 "${noteTitle}" 吗？`)) {
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          deleteNote(noteId)
          console.log('Note deleted successfully')
        } else {
          console.error('Failed to delete note')
        }
      } catch (error) {
        console.error('Error deleting note:', error)
      }
    }
    onClose()
  }

  if (!isOpen) return null

  return (
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
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              onClick={handleArchive}
            >
              <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                <ArchiveIcon className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Archive
              </span>
            </div>
          </div>

          {/* 删除 */}
          <div className="px-1">
            <div
              role="menuitem"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-600/20 cursor-pointer transition-colors"
              onClick={handleDelete}
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
  )
}
