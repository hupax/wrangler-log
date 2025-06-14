'use client'
// import { useState } from 'react'
// import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './liquid-glass.css'
import {
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NotebookIcon,
  ChartIcon,
  NewNoteIcon,
} from './icons'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Header() {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="liquid-glass-header">
      <div className="flex items-center pl-8">
        <div className="liquid-glass-icon-container">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="transition-transform duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            style={{
              transform: isSidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              willChange: 'transform',
            }}
          >
            <MenuIcon width={20} height={20} className="text-white/90" />
          </button>
        </div>

        <div className="liquid-glass-action-button ml-10">
          <NewNoteIcon
            width={20}
            height={20}
            className="text-white/90 hover:text-white cursor-pointer transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pr-8">
        <div className="liquid-glass-action-button">
          <NotebookIcon
            width={20}
            height={20}
            className="text-white/90 hover:text-white cursor-pointer transition-all duration-300"
          />
        </div>
        {/* <div className="liquid-glass-action-button">
          <ChartIcon
            width={20}
            height={20}
            className="text-white/90 hover:text-white cursor-pointer transition-all duration-300"
          />
        </div> */}
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  )
}
