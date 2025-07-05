'use client'

import { useNotesStore } from '@/lib/store'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setLoading } = useNotesStore()
// 监听 Firebase 认证状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        })
      } else {
        setUser(null)
      }
      // Firebase Auth 初始化完成
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}
