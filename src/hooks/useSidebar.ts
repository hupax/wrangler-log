import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useNotesStore, Note, Folder } from '@/stores/notes'

interface FolderWithChildren extends Folder {
  children: FolderWithChildren[]
}

export function useFolderState() {
  const { user } = useAuthStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  // 从localStorage读取展开状态
  const loadExpandedState = useCallback((userId: string): Set<string> => {
    try {
      const key = `sidebar_expanded_folders_${userId}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const folderIds = JSON.parse(saved)
        return new Set(folderIds)
      }
    } catch (error) {
      console.error('Failed to load expanded state from localStorage:', error)
    }
    return new Set()
  }, [])

  // 保存展开状态到localStorage
  const saveExpandedState = useCallback(
    (userId: string, expandedFolders: Set<string>) => {
      try {
        const key = `sidebar_expanded_folders_${userId}`
        const folderIds = Array.from(expandedFolders)
        localStorage.setItem(key, JSON.stringify(folderIds))
      } catch (error) {
        console.error('Failed to save expanded state to localStorage:', error)
      }
    },
    []
  )

  // 当用户登录后，加载其展开状态
  useEffect(() => {
    if (user?.uid) {
      const savedExpandedState = loadExpandedState(user.uid)
      setExpandedFolders(savedExpandedState)
    }
  }, [user?.uid, loadExpandedState])

  // 切换文件夹展开/收起状态
  const toggleFolderExpanded = useCallback(
    (folderId: string) => {
      setExpandedFolders(prev => {
        const newSet = new Set(prev)
        if (newSet.has(folderId)) {
          newSet.delete(folderId)
        } else {
          newSet.add(folderId)
        }

        // 保存到localStorage
        if (user?.uid) {
          saveExpandedState(user.uid, newSet)
        }

        return newSet
      })
    },
    [user?.uid, saveExpandedState]
  )

  return {
    expandedFolders,
    toggleFolderExpanded,
  }
}

export function useSidebarData() {
  const { user, isLoading } = useAuthStore()
  const { notes, folders, fetchNotes, fetchFolders } = useNotesStore()

  // 加载笔记和文件夹列表
  useEffect(() => {
    const loadData = async () => {
      if (isLoading || !user) return

      try {
        await Promise.all([fetchNotes(user), fetchFolders(user)])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    loadData()
  }, [fetchNotes, fetchFolders, user, isLoading])

  return { notes, folders, isLoading: isLoading || !user }
}

export function useFolderTree() {
  const { folders } = useSidebarData()

  // 构建文件夹树结构
  const buildFolderTree = useCallback(() => {
    const folderMap = new Map()
    const rootFolders: FolderWithChildren[] = []

    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
      })
    })

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
  }, [folders])

  return { folderTree: buildFolderTree() }
}

export function useNotesByFolder() {
  const { notes } = useSidebarData()

  // 获取文件夹下的笔记
  const getFolderNotes = useCallback(
    (folderId: string) => {
      return notes.filter(note => note.folderId === folderId)
    },
    [notes]
  )

  // 获取根目录下的笔记（没有folderId的笔记）
  const getRootNotes = useCallback(() => {
    return notes.filter(note => !note.folderId)
  }, [notes])

  return {
    getFolderNotes,
    getRootNotes,
  }
}
