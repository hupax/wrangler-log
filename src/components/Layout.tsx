'use client'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)

  // 从localStorage读取侧边栏状态（无动画）
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen')
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState))
    }
  }, [])

  // 保存侧边栏状态到localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen))
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setShouldAnimate(true) // 启用动画
    setIsSidebarOpen(!isSidebarOpen)
    // 动画完成后重置动画状态
    setTimeout(() => setShouldAnimate(false), 400)
  }

  const closeSidebar = () => {
    setShouldAnimate(true) // 启用动画
    setIsSidebarOpen(false)
    // 动画完成后重置动画状态
    setTimeout(() => setShouldAnimate(false), 400)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 侧边栏 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        shouldAnimate={shouldAnimate}
      />

      {/* 主内容区域 */}
      <div
        className="min-h-screen flex flex-col"
        style={{
          marginLeft: isSidebarOpen ? '320px' : '0px',
          transition: shouldAnimate
            ? 'margin-left 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
            : 'none',
          willChange: 'margin-left',
        }}
      >
        <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1">{children}</main>
      </div>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          style={{
            transition: shouldAnimate
              ? 'opacity 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
              : 'none',
            willChange: 'opacity',
          }}
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}
