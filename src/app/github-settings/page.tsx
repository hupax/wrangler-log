'use client'
import GitHubSettings from '@/components/GithubSettings'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function GithubSettingsPage() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <GitHubSettings />
      </div>
    </div>
  )
}
