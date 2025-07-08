// 统一导出所有stores
export { useAuthStore, type User } from './auth'
export { useNotesStore, type Note, type Folder } from './notes'
export { useGitHubStore } from './github'

// 为了向后兼容，也可以从这里导出组合的hook
import { useAuthStore } from './auth'
import { useNotesStore } from './notes'
import { useGitHubStore } from './github'

// 提供一个组合hook用于需要多个store的场景
export const useAppStores = () => {
  const auth = useAuthStore()
  const notes = useNotesStore()
  const github = useGitHubStore()

  return { auth, notes, github }
}
