import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Note, Folder } from '@/stores/notes'
import {
  MoreOptionsIcon,
  ChevronRightSimpleIcon,
  ChevronDownSimpleIcon,
} from '../icons'

interface FolderWithChildren extends Folder {
  children: FolderWithChildren[]
}

interface FolderTreeProps {
  folders: FolderWithChildren[]
  notes: Note[]
  expandedFolders: Set<string>
  onToggleFolderExpanded: (folderId: string) => void
  onOptionsClick: (e: React.MouseEvent, noteId: string) => void
  buttonRefs: React.MutableRefObject<{
    [key: string]: HTMLButtonElement | null
  }>
}

export default function FolderTree({
  folders,
  notes,
  expandedFolders,
  onToggleFolderExpanded,
  onOptionsClick,
  buttonRefs,
}: FolderTreeProps) {
  const pathname = usePathname() || '/notes/1'

  const getFolderNotes = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId)
  }

  const handleLinkClick = (e: React.MouseEvent, noteHref: string) => {
    if (pathname === noteHref) {
      e.preventDefault()
      return
    }
  }

  // 递归渲染文件夹和笔记
  const renderItems = (
    folder: FolderWithChildren,
    level: number = 0
  ): React.ReactNode[] => {
    const items: React.ReactNode[] = []
    const folderNotes = getFolderNotes(folder.id)
    const isExpanded = expandedFolders.has(folder.id)
    const hasChildren = folder.children.length > 0 || folderNotes.length > 0

    // 渲染文件夹本身
    items.push(
      <div
        key={`folder-${folder.id}`}
        className="group flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:bg-[rgb(239,239,239)] duration-200 relative"
        style={{ paddingLeft: `${12 + level * 20}px` }}
        onClick={() => hasChildren && onToggleFolderExpanded(folder.id)}
        draggable="true"
      >
        <div className="flex min-w-0 grow items-center gap-2">
          {/* 箭头图标 - 展开时向下，收起时向右 */}
          <div className="w-3 h-3 flex items-center justify-center relative">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownSimpleIcon className="text-gray-500" />
              ) : (
                <ChevronRightSimpleIcon className="text-gray-500" />
              )
            ) : (
              <ChevronRightSimpleIcon className="text-gray-500" />
            )}
          </div>

          <div className="truncate">
            <span className="text-sm text-gray-900 font-medium" dir="auto">
              {folder.name}
            </span>
          </div>
        </div>
      </div>
    )

    // 只有在展开状态且有子项时才渲染内容
    if (isExpanded && hasChildren) {
      // 先渲染文件夹内的笔记
      folderNotes.forEach(note => {
        items.push(
          <Link
            key={`note-${note.id}`}
            href={`/notes/${note.id}`}
            prefetch={true}
            onClick={e => handleLinkClick(e, `/notes/${note.id}`)}
            className={`group flex items-center justify-between px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:bg-[rgb(239,239,239)] duration-200 relative ${
              pathname === `/notes/${note.id}` ? 'bg-[rgb(239,239,239)]' : ''
            }`}
            style={{ paddingLeft: `${32 + level * 20}px` }}
            draggable="true"
          >
            <div className="flex min-w-0 grow items-center gap-2 relative z-10">
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

            <div className="text-gray-500 flex items-center self-stretch relative z-10">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  ref={el => {
                    if (el) buttonRefs.current[note.id] = el
                  }}
                  className="w-7 h-7 flex items-center justify-center transition-all duration-150 cursor-pointer"
                  onClick={e => onOptionsClick(e, note.id)}
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
        )
      })

      // 再递归渲染子文件夹
      folder.children.forEach((child: FolderWithChildren) => {
        const childFolderItems = renderItems(child, level + 1)
        items.push(...childFolderItems)
      })
    }

    return items
  }

  // 生成所有显示项
  const allItems: React.ReactNode[] = []
  folders.forEach(folder => {
    allItems.push(...renderItems(folder, 0))
  })

  return <>{allItems}</>
}
