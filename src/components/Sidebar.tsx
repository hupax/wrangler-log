import { usePathname } from 'next/navigation'
import {
  NewNoteIcon,
  SearchIcon,
  MenuIcon,
  NewFolderIcon,
  MoreOptionsIcon,
} from './icons'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import NoteOptionsMenu from './NoteOptionsMenu'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const router = useRouter()
  const pathname = usePathname() || '/notes/1'
  const { user, isLoading } = useAuthStore()
  const { notes, fetchNotes } = useNotesStore()
  const [activeMenuNoteId, setActiveMenuNoteId] = useState<string | null>(null)
  const [showSeparator, setShowSeparator] = useState(false)
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const handleLinkClick = (e: React.MouseEvent, noteHref: string) => {
    // 如果点击的是当前页面，阻止刷新
    if (pathname === noteHref) {
      e.preventDefault()
      return
    }
  }

  const handleOptionsClick = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setActiveMenuNoteId(activeMenuNoteId === noteId ? null : noteId)
  }

  const handleMenuClose = () => {
    setActiveMenuNoteId(null)
  }

  // 加载笔记列表
  useEffect(() => {
    const loadNotes = async () => {
      // 如果还在加载中或用户未登录，不要发送请求
      if (isLoading || !user) return

      try {
        await fetchNotes(user)
      } catch (error) {
        console.error('Failed to fetch notes:', error)
      }
    }

    loadNotes()
  }, [fetchNotes, user, isLoading])

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

  const menuItems = [
    {
      icon: NewNoteIcon,
      label: 'New Note',
      action: () => {
        router.push('/')
      },
    },
    {
      icon: SearchIcon,
      label: 'Search Note',
      action: () => {
        console.log('Search Note clicked')
        onClose()
      },
    },
    {
      icon: NewFolderIcon,
      label: 'New Folder',
      action: () => {
        console.log('New Folder clicked')
        onClose()
      },
      separator: true,
    },
  ]

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
      {/* 侧边栏顶部 - 与导航栏平行的菜单图标 - 粘性定位 */}
      <div className="sticky top-0 bg-[rgb(249,249,249)] z-10 flex justify-end px-4 py-2">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-[rgb(239,239,239)] hover:border-gray-100 border-2 border-transparent transition-all duration-200 cursor-w-resize"
          style={{
            transform: 'rotate(90deg)',
            willChange: 'transform',
          }}
        >
          <MenuIcon width={18} height={18} className="text-black" />
        </button>
      </div>

      {/* 上方区域 - 固定不滚动 - 粘性定位 */}
      <div className="sticky top-12 bg-[rgb(249,249,249)] z-10 px-4 pb-0">
        <div className="space-y-1 pb-4">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-[rgb(239,239,239)] hover:border-gray-100 border-2 border-transparent text-gray-700 transition-all duration-200 cursor-pointer
                  ${item.separator ? 'mt-6' : ''}
                  `}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 分隔线 - 仅在滚动时显示 */}
        <div
          className={`border-t border-gray-200 -mx-4 transition-opacity duration-200 ${
            showSeparator ? 'opacity-100' : 'opacity-0'
          }`}
        ></div>
      </div>

      <div className="px-4 py-4">
        <h3 className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Notes
        </h3>

        <div className="space-y-px">
          {notes.map(note => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              prefetch={true}
              onClick={e => handleLinkClick(e, `/notes/${note.id}`)}
              className={`group flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:bg-[rgb(239,239,239)] duration-200 ${
                pathname === `/notes/${note.id}` ? 'bg-[rgb(239,239,239)]' : ''
              }`}
              draggable="true"
            >
              <div className="flex min-w-0 grow items-center gap-2">
                <div className="truncate">
                  <span
                    className={`text-sm ${
                      pathname === `/notes/${note.id}`
                        ? 'text-gray-800'
                        : 'text-gray-700'
                    }`}
                    dir="auto"
                  >
                    {note.title}
                  </span>
                </div>
              </div>

              <div className="text-gray-500 flex items-center self-stretch">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    ref={el => {
                      if (el) buttonRefs.current[note.id] = el
                    }}
                    className="w-7 h-7 flex items-center justify-center transition-all duration-150 cursor-pointer"
                    onClick={e => handleOptionsClick(e, note.id)}
                    aria-label="Open note options"
                  >
                    <MoreOptionsIcon
                      width={20}
                      height={20}
                      className="w-5 h-5 text-gray-700"
                    />
                  </button>
                </div>
              </div>
            </Link>
          ))}
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

export default Sidebar
