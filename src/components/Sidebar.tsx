import { NewNoteIcon, SearchIcon } from './icons'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    {
      icon: NewNoteIcon,
      label: 'New Note',
      action: () => {
        console.log('New Note clicked')
        onClose()
      },
    },
    {
      icon: SearchIcon,
      label: 'Search Note',
      action: () => {
        console.log('Search Note clicked')
        onClose()
      },
    },
  ]

  return (
    <>
      {/* 遮罩层 - 超快响应 */}
      <div
        className={`
          fixed inset-0 z-40 transition-all duration-150 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${
            isOpen
              ? 'opacity-100 backdrop-blur-sm bg-black/30'
              : 'opacity-0 pointer-events-none bg-black/0'
          }
        `}
        onClick={onClose}
        style={{
          willChange: 'opacity, backdrop-filter',
        }}
      />

      <div
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw]
          bg-gradient-to-br from-purple-50/95 to-indigo-50/95
          backdrop-blur-xl border-r border-purple-200/50
          shadow-2xl shadow-purple-500/10
        `}
        style={{
          // 现代弹性物理动画
          transition: 'transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          willChange: 'transform',
          // 弹性进入效果
          transform: isOpen
            ? 'translate3d(0, 0, 0)'
            : 'translate3d(-100%, 0, 0)',
          // 优化渲染性能
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      >
        {/* 内容容器 - 交错动画 */}
        <div
          className={`
            p-6 pt-20 transition-all duration-200 ease-out
            ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
          `}
        >
          {/* 菜单项 - 微交互优化 */}
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl
                  bg-white/60 hover:bg-white/80 active:bg-white/90
                  border border-purple-100/50 hover:border-purple-200/70
                  text-gray-700 hover:text-purple-700
                  shadow-sm hover:shadow-md active:shadow-lg
                  transition-all duration-150 ease-out
                  hover:-translate-y-0.5 active:translate-y-0
                  group
                `}
              >
                <item.icon className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
