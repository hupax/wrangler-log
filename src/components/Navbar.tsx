'use client'
import {
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NotebookIcon,
  ChartIcon,
  NewNoteIcon,
} from './icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import UserProfile from './auth/UserProfile'
import LoginButton from './auth/LoginButton'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => {
      // 找到实际的滚动容器 - main元素
      const mainElement = document.querySelector('main')
      if (mainElement) {
        const scrollTop = mainElement.scrollTop
        const newIsScrolled = scrollTop > 50
        setIsScrolled(newIsScrolled)
      }
    }

    // 延迟一下确保DOM已经渲染
    const timer = setTimeout(() => {
      const mainElement = document.querySelector('main')
      if (mainElement) {
        handleScroll()
        mainElement.addEventListener('scroll', handleScroll, { passive: true })
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 sticky top-0 z-50 bg-white">
      {/* 分割线 - 带渐变效果 */}
      <div
        className={`absolute bottom-0 left-0 w-full h-px bg-gray-200 transition-opacity duration-200 ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>

      <div className="flex items-center pl-2">
        <button
          onClick={onToggleSidebar}
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent cursor-e-resize ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transform: isSidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
            willChange: 'transform, opacity, scale',
          }}
        >
          <MenuIcon width={18} height={18} className="text-black" />
        </button>

        <button
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent ml-8 cursor-pointer ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
            willChange: 'opacity, scale',
          }}
          onClick={() => {
            router.push('/')
          }}
        >
          <NewNoteIcon width={18} height={18} className="text-black" />
        </button>
      </div>

      {/* 中间空白区域 */}
      <div className="flex-1"></div>

      {/* 右侧按钮组 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/subconverter')}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-200 cursor-pointer"
          title="节点转换器"
        >
          <svg
            width={18}
            height={18}
            className="text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-200 cursor-pointer">
          <NotebookIcon width={18} height={18} className="text-black" />
        </button>

        {/* 认证部分 */}
        <div className="auth-section ml-2 ">
          {isAuthenticated ? <UserProfile /> : <LoginButton />}
        </div>
      </div>
    </div>
  )
}
