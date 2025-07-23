'use client'

import { useAuthStore } from '@/stores/auth'
import { useNotesStore } from '@/stores/notes'
import { useGitHubStore } from '@/stores/github'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'

// 创建或更新用户记录
const createOrUpdateUser = async (user: any) => {
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      }),
    })
  } catch (error) {
    console.error('Failed to create/update user:', error)
  }
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setLoading } = useAuthStore()
  const { clearAll } = useNotesStore()
  const { clearGitHubData } = useGitHubStore()

  // 监听 Firebase 认证状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        }

        setUser(userData)

        // 自动创建或更新用户记录
        await createOrUpdateUser(userData)
      } else {
        setUser(null)
        // 清空所有相关数据
        clearAll()
        clearGitHubData()
      }
      // Firebase Auth 初始化完成
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading, clearAll, clearGitHubData])

  return <>{children}</>
}
