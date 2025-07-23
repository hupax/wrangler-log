import React, { useState, useRef, useEffect } from 'react'
import { useFolderState, useFolderTree, useNotesByFolder, useSidebarData } from '@/hooks/useSidebar'
import SidebarHeader from './sidebar/SidebarHeader'
import FolderTree from './sidebar/FolderTree'
import NoteList from './sidebar/NoteList'
import NoteOptionsMenu from './NoteOptionsMenu'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { notes, folders } = useSidebarData()
  const { expandedFolders, toggleFolderExpanded } = useFolderState()
  const { folderTree } = useFolderTree()

  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null)
  const [showSeparator, setShowSeparator] = useState(false)
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const handleOptionsClick = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveMenuNoteId(activeMenuNoteId === noteId ? null : noteId)
  }

  const handleMenuClose = () => {
    setActiveMenuNoteId(null)
  }

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollTop = scrollContainerRef.current.scrollTop
        // 当滚动超过15px时显示分隔线
        setShowSeparator(scrollTop > 15)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className="h-full bg-[rgb(249,249,249)] border-r border-gray-200 flex flex-col overflow-y-auto openai-scrollbar"
      style={{
        borderRightWidth: '1px',
        borderRightColor: 'rgb(237, 237, 237)',
        boxShadow: 'none',
      }}
    >
      <SidebarHeader
        onClose={onClose}
        showSeparator={showSeparator}
      />

      <div className="px-4 py-4">
        <h3 className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Notes
        </h3>

        <div className="space-y-px">
          {/* 渲染文件夹树 */}
          <FolderTree
            folders={folderTree}
            notes={notes}
            expandedFolders={expandedFolders}
            onToggleFolderExpanded={toggleFolderExpanded}
            onOptionsClick={handleOptionsClick}
            buttonRefs={buttonRefs}
          />

          {/* 渲染根目录笔记 */}
          <NoteList
            notes={notes}
            onOptionsClick={handleOptionsClick}
            buttonRefs={buttonRefs}
          />
        </div>
      </div>

      {/* 笔记选项菜单 */}
      {activeMenuNoteId && (
        <NoteOptionsMenu
          noteId={activeMenuNoteId}
          noteTitle={notes.find(n => n.id === activeMenuNoteId)?.title || ''}
          isOpen={true}
          onClose={handleMenuClose}
          buttonRef={{ current: buttonRefs.current[activeMenuNoteId] || null }}
        />
      )}
    </div>
  )
}
