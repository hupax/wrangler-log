'use client'
import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 从localStorage读取侧边栏状态
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
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-white flex">
      {/* 侧边栏容器 - 真正推拉 */}
      <div
        style={{
          width: isSidebarOpen ? '260px' : '0px',
          transition: 'width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
          willChange: 'width',
        }}
        className="overflow-hidden"
      >
        <div className="w-[260px] h-full overflow-y-auto">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>
      </div>

      {/* 主内容 - 被推动 */}
      <div className="h-screen flex flex-col flex-1 overflow-hidden">
        <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto main-scrollbar">
          {children}
        </main>
      </div>

      {/* 移动端遮罩层 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  )
}
