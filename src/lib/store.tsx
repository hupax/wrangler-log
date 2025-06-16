// 创建全局状态管理
import { create } from 'zustand'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  prompt?: string
  tags?: string[]
}

interface NotesStore {
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean

  // Actions
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (note: Note | null) => void
  setLoading: (loading: boolean) => void
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,

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
}))
