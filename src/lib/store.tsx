// 创建全局状态管理
import { create } from 'zustand'
import { GitHubConfig } from './github'

interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

interface Note {
  id: string
  userId: string
  title: string
  content: string
  createdAt: Date | string
  updatedAt: Date | string
  prompt?: string
  tags?: string[]

  // GitHub 相关
  githubPath?: string
  githubSha?: string
  lastSyncedAt?: Date | string
  syncStatus?: 'synced' | 'pending' | 'conflict' | 'error' | 'not_synced'

  folderId?: string | null
}

interface Folder {
  id: string
  userId: string
  name: string
  parentId?: string
  githubPath?: string
  createdAt: Date | string
  updatedAt: Date | string
}

interface NotesStore {
  notes: Note[]
  user: User | null
  currentNote: Note | null
  isLoading: boolean
  isAuthenticated: boolean
  // 新增 GitHub 相关状态
  githubConfig: GitHubConfig | null
  isGitHubConnected: boolean

  // Folder
  folders: Folder[]
  currentFolder: Folder | null
  expandedFolders: Set<string>

  // Actions
  setUser: (user: User | null) => void
  signOut: () => void
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: Note | null) => void
  setLoading: (loading: boolean) => void
  fetchNotes: () => Promise<void>
  fetchNote: (noteId: string) => Promise<Note | null>

  // GitHub Actions
  setGitHubConfig: (config: GitHubConfig | null) => void
  setGitHubConnected: (connected: boolean) => void

  // Folder Actions
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  setCurrentFolder: (folder: Folder | null) => void
  setExpandedFolders: (folderIds: Set<string>) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  moveNoteToFolder: (noteId: string, folderId: string) => void
  fetchFolders: () => Promise<void>
  toggleFolderExpanded: (folderId: string) => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  user: null,
  currentNote: null,
  isLoading: true,
  isAuthenticated: false,

  // GitHub Status
  githubConfig: null,
  isGitHubConnected: false,

  // Folder
  folders: [],
  currentFolder: null,
  expandedFolders: new Set<string>(),

  setUser: user => set({ user, isAuthenticated: !!user }),
  signOut: () =>
    set({
      user: null,
      isAuthenticated: false,
      notes: [],
      currentNote: null,
      folders: [],
      currentFolder: null,
      expandedFolders: new Set<string>(),
      githubConfig: null,
      isGitHubConnected: false,
    }),
  setNotes: notes => set({ notes }),
  addNote: note =>
    set(state => ({
      notes: [note, ...state.notes],
    })),
  updateNote: (id, updates) =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, ...updates } : note
      ),
    })),
  deleteNote: id =>
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
    })),
  setCurrentNote: note => set({ currentNote: note }),
  setLoading: loading => set({ isLoading: loading }),

  // GitHub Actions
  setGitHubConfig: config => set({ githubConfig: config }),
  setGitHubConnected: connected => set({ isGitHubConnected: connected }),

  // Folder Actions
  setFolders: folders => set({ folders }),
  addFolder: folder => set(state => ({ folders: [folder, ...state.folders] })),
  updateFolder: (id, updates) =>
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    })),
  deleteFolder: id =>
    set(state => ({
      folders: state.folders.filter(folder => folder.id !== id),
      // 同时移除该文件夹下的所有笔记的 folderId
      notes: state.notes.map(note =>
        note.folderId === id ? { ...note, folderId: null } : note
      ),
    })),
  setCurrentFolder: folder => set({ currentFolder: folder }),
  moveNoteToFolder: (noteId, folderId) =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === noteId ? { ...note, folderId } : note
      ),
    })),
  toggleFolderExpanded: folderId =>
    set(state => {
      const newExpanded = new Set(state.expandedFolders)
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId)
      } else {
        newExpanded.add(folderId)
      }
      return { expandedFolders: newExpanded }
    }),
  setExpandedFolders: expanded => set({ expandedFolders: expanded }),

  // Folder API
  fetchFolders: async () => {
    const { user } = get()
    if (!user?.uid) return
    try {
      const response = await fetch(`/api/folders?userId=${user.uid}`)
      const data = await response.json()

      if (response.ok && data.folders) {
        const folders = data.folders.map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
          updatedAt: new Date(folder.updatedAt),
        }))
        set({ folders })
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
    }
  },

  // 获取用户的所有笔记
  fetchNotes: async () => {
    const { user } = get()
    if (!user?.uid) return

    set({ isLoading: true })
    try {
      const response = await fetch(`/api/notes?userId=${user.uid}`)
      const data = await response.json()

      if (response.ok && data.notes) {
        // 转换日期字符串为Date对象
        const notes = data.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }))
        set({ notes })
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // 获取单个笔记
  fetchNote: async (noteId: string) => {
    const { user } = get()
    if (!user?.uid) return null

    try {
      const response = await fetch(`/api/notes/${noteId}?userId=${user.uid}`)
      const data = await response.json()

      if (response.ok && data.note) {
        const note = {
          ...data.note,
          createdAt: new Date(data.note.createdAt),
          updatedAt: new Date(data.note.updatedAt),
        }
        set({ currentNote: note })
        return note
      }
    } catch (error) {
      console.error('Failed to fetch note:', error)
    }
    return null
  },
}))

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
}
