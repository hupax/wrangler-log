import { create } from 'zustand'
import { User } from './auth'

export interface Note {
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

export interface Folder {
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
  currentNote: Note | null
  folders: Folder[]
  currentFolder: Folder | null
  expandedFolders: Set<string>

  // Notes Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: Note | null) => void
  fetchNotes: (user: User) => Promise<void>
  fetchNote: (noteId: string, user: User) => Promise<Note | null>

  // Folder Actions
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  setCurrentFolder: (folder: Folder | null) => void
  setExpandedFolders: (folderIds: Set<string>) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  moveNoteToFolder: (noteId: string, folderId: string) => void
  fetchFolders: (user: User) => Promise<void>
  toggleFolderExpanded: (folderId: string) => void

  // Clear data on signout
  clearAll: () => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  folders: [],
  currentFolder: null,
  expandedFolders: new Set<string>(),

  // Notes Actions
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

  // API Methods
  fetchFolders: async (user: User) => {
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
    }
  },

  fetchNotes: async (user: User) => {
    if (!user?.uid) return

    try {
      const response = await fetch(`/api/notes?userId=${user.uid}`)
      const data = await response.json()

      if (response.ok && data.notes) {
        const notes = data.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }))
        set({ notes })
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    }
  },

  fetchNote: async (noteId: string, user: User) => {
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

  clearAll: () =>
    set({
      notes: [],
      currentNote: null,
      folders: [],
      currentFolder: null,
      expandedFolders: new Set<string>(),
    }),
}))
