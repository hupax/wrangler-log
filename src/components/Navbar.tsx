'use client'
// import { useState } from 'react'
// import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NotebookIcon,
  ChartIcon,
  NewNoteIcon,
} from './icons'
import { useState, useEffect } from 'react'

interface NavbarProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function Header({
  onToggleSidebar,
  isSidebarOpen,
}: NavbarProps) {
  // const [startDate, setStartDate] = useState<Date | null>(new Date())
  // const formatDate = (date: Date) => {
  //   const year = date.getFullYear()
  //   const month = date.getMonth() + 1
  //   const day = date.getDate()
  //   const weekdays = [
  //     '星期日',
  //     '星期一',
  //     '星期二',
  //     '星期三',
  //     '星期四',
  //     '星期五',
  //     '星期六',
  //   ]
  //   const weekday = weekdays[date.getDay()]
  //   return `${year}年${month}月${day}日·${weekday}`
  // }

  // const goToPreviousDay = () => {
  //   if (startDate) {
  //     const newDate = new Date(startDate)
  //     newDate.setDate(newDate.getDate() - 1)
  //     setStartDate(newDate)
  //   }
  // }

  // const goToNextDay = () => {
  //   if (startDate) {
  //     const newDate = new Date(startDate)
  //     newDate.setDate(newDate.getDate() + 1)
  //     setStartDate(newDate)
  //   }
  // }
  const [isScrolled, setIsScrolled] = useState(false)

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
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-400 ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transform: isSidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            willChange: 'transform, opacity, scale',
          }}
        >
          <MenuIcon width={18} height={18} className="text-black" />
        </button>

        <button
          className={`w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-400 ml-8 ${
            isSidebarOpen
              ? 'opacity-0 pointer-events-none scale-50'
              : 'opacity-100 scale-100'
          }`}
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
