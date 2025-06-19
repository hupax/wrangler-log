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

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
  shouldAnimate?: boolean
}

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
  shouldAnimate = false,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const newIsScrolled = scrollTop > 50
      setIsScrolled(newIsScrolled)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="flex items-center justify-between w-full px-4 py-2 sticky top-0 z-50 bg-white">
      {/* 分割线 */}
      {isScrolled && (
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
      )}

      <div className="flex items-center pl-2">
        <button
          onClick={onToggleSidebar}
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transform: isSidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: shouldAnimate
              ? 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
              : 'none',
            willChange: 'transform, opacity, scale',
          }}
        >
          <MenuIcon width={18} height={18} className="text-black" />
        </button>

        <button
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent ml-8 ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transition: shouldAnimate
              ? 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
              : 'none',
            willChange: 'opacity, scale',
          }}
          onClick={() => {
            router.push('/')
          }}
        >
          <NewNoteIcon width={18} height={18} className="text-black" />
        </button>
      </div>

      <div className="flex items-center gap-4 pr-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-200">
          <NotebookIcon width={18} height={18} className="text-black" />
        </button>
        {/* <div className="liquid-glass-action-button">
          <ChartIcon
            width={20}
            height={20}
            className="text-white/90 hover:text-white cursor-pointer transition-all duration-300"
          />
        </div> */}
      </div>
    </div>
  )
}
