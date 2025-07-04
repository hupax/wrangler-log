'use client'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useNotesStore } from '@/lib/store'

export default function LoginButton() {
  const { setUser } = useNotesStore()

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const User = result.user

      setUser({
        uid: User.uid,
        email: User.email || '',
        displayName: User.displayName || '',
        photoURL: User.photoURL || '',
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      className="btn relative btn-primary"
      data-testid="login-button"
    >
      <div className="flex items-center justify-center">Log in</div>
    </button>
  )
}
