import { usePathname } from 'next/navigation'
import {
  NewNoteIcon,
  SearchIcon,
  MenuIcon,
  NewFolderIcon,
  MoreOptionsIcon,
} from './icons'
import Link from 'next/link'
import React from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  shouldAnimate?: boolean
}

const Sidebar = ({ isOpen, onClose, shouldAnimate = false }: SidebarProps) => {
  const menuItems = [
    {
      icon: NewNoteIcon,
      label: 'New Note',
      action: () => {
        console.log('New Note clicked')
        onClose()
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

  const pathname = usePathname() || '/notes/1'

  const handleLinkClick = (e: React.MouseEvent, noteHref: string) => {
    // 如果点击的是当前页面，阻止刷新
    if (pathname === noteHref) {
      e.preventDefault()
      return
    }

  }

  const noteItems = [
    {
      id: '1',
      title: 'SSR Hydration 错误修复',
      href: '/notes/1',
    },
    {
      id: '2',
      title: 'TSX语法介绍',
      href: '/notes/2',
    },
    {
      id: '3',
      title: 'https-caddy',
      href: '/notes/3',
    },
  ]

  return (
    <div
      className={`
        fixed top-0 left-0 h-screen bg-gray-50 border-r border-gray-200 overflow-hidden z-40
        ${isOpen ? 'w-[260px]' : 'w-0'}
      `}
      style={{
        transition: shouldAnimate
          ? 'width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
          : 'none',
        willChange: 'width',
      }}
    >
      <div className="w-[260px] h-full flex flex-col">
        {/* 侧边栏顶部 - 与导航栏平行的菜单图标 */}
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-200"
            style={{
              transform: 'rotate(90deg)',
              willChange: 'transform',
            }}
          >
            <MenuIcon width={18} height={18} className="text-black" />
          </button>
        </div>

        {/* 侧边栏内容 */}
        <div className="px-4 pb-6 flex-1">
          <div className="space-y-1">
            {menuItems.map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent text-gray-700 transition-all duration-200
                  ${item.separator ? 'mt-6' : ''}
                  `}
              >
                {item.icon && <item.icon className="w-5 h-5" />}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}

            <h3 className="px-3 pt-6 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Notes
            </h3>

            <div className="space-y-px">
              {noteItems.map(note => (
                <Link
                  key={note.id}
                  href={note.href}
                  prefetch={true}
                  onClick={(e) => handleLinkClick(e, note.href)}
                  className={`group flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors duration-200 ${
                    pathname === note.href ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                  draggable="true"
                >
                  <div className="flex min-w-0 grow items-center gap-2">
                    <div className="truncate">
                      <span
                        className={`text-sm ${
                          pathname === note.href
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
                        className="w-7 h-7 flex items-center justify-center transition-all duration-150"
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Options clicked for', note.title)
                        }}
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
        </div>
      </div>
    </div>
  )
}

export default Sidebar
