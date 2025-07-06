'use client'

import { useState } from 'react'
import { useNotesStore } from '@/lib/store'
import {
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FileIcon,
  MoreOptionsIcon,
} from '@/components/icons'
import SyncStatusIcon from '@/components/SyncStatusIcon'

interface FolderTreeProps {
  onNoteClick?: (noteId: string) => void
}

export default function FolderTree({ onNoteClick }: FolderTreeProps) {
  const {
    notes,
    folders,
    currentFolder,
    currentNote,
    expandedFolders,
    setCurrentFolder,
    toggleFolderExpanded,
  } = useNotesStore()

  // 构建文件夹树结构
  const buildFolderTree = () => {
    // 创建文件夹映射
    const folderMap = new Map()
    const rootFolders: any[] = []

    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
      })
    })

    // 构建树结构
    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children.push(folderNode)
        }
      } else {
        rootFolders.push(folderNode)
      }
    })

    return rootFolders
  }

  // 获取文件夹下的笔记
  const getFolderNotes = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId)
  }

  // 获取根目录下的笔记
  const getRootNotes = () => {
    return notes.filter(note => !note.folderId)
  }

  // 渲染文件夹节点
  const renderFolderNode = (folder: any, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const folderNotes = getFolderNotes(folder.id)
    const hasChildren = folder.children.length > 0 || folderNotes.length > 0

    return (
      <div key={folder.id} className="select-none">
        {/* 文件夹行 */}
        <div
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => hasChildren && toggleFolderExpanded(folder.id)}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDownIcon
                  width={12}
                  height={12}
                  className="text-gray-500"
                />
              ) : (
                <ChevronRightIcon
                  width={12}
                  height={12}
                  className="text-gray-500"
                />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}

          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isExpanded ? (
              <FolderOpenIcon
                width={16}
                height={16}
                className="text-blue-500 flex-shrink-0"
              />
            ) : (
              <FolderIcon
                width={16}
                height={16}
                className="text-blue-500 flex-shrink-0"
              />
            )}
            <span className="text-sm font-medium text-gray-700 truncate">
              {folder.name}
            </span>
            <span className="text-xs text-gray-500">
              ({folderNotes.length})
            </span>
          </div>

          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
            <MoreOptionsIcon width={14} height={14} className="text-gray-500" />
          </button>
        </div>

        {/* 展开的内容 */}
        {isExpanded && (
          <div className="ml-4">
            {/* 子文件夹 */}
            {folder.children.map((child: any) =>
              renderFolderNode(child, level + 1)
            )}

            {/* 文件夹下的笔记 */}
            {folderNotes.map(note => (
              <div
                key={note.id}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                  currentNote?.id === note.id
                    ? 'bg-blue-50 border-l-2 border-blue-500'
                    : ''
                }`}
                style={{ paddingLeft: `${28 + level * 16}px` }}
                onClick={() => onNoteClick?.(note.id)}
              >
                <FileIcon
                  width={14}
                  height={14}
                  className="text-gray-400 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 truncate flex-1">
                  {note.title}
                </span>
                <SyncStatusIcon status={note.syncStatus} size={12} />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const folderTree = buildFolderTree()
  const rootNotes = getRootNotes()

  return (
    <div className="folder-tree">
      {/* 根目录下的文件夹 */}
      {folderTree.map(folder => renderFolderNode(folder))}

      {/* 根目录下的笔记 */}
      {rootNotes.length > 0 && (
        <div className="mt-2">
          <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
            其他笔记
          </div>
          {rootNotes.map(note => (
            <div
              key={note.id}
              className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                currentNote?.id === note.id
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : ''
              }`}
              onClick={() => onNoteClick?.(note.id)}
            >
              <FileIcon
                width={14}
                height={14}
                className="text-gray-400 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 truncate flex-1">
                {note.title}
              </span>
              <SyncStatusIcon status={note.syncStatus} size={12} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
