import { NewNoteIcon, SearchIcon, MenuIcon, NewFolderIcon } from './icons'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  shouldAnimate?: boolean
}

const Sidebar = ({ isOpen, onClose, shouldAnimate = false }: SidebarProps) => {
  const menuItems = [
    {
      icon: NewNoteIcon,
      label: 'New Note',
      action: () => {
        console.log('New Note clicked')
        onClose()
      },
    },
    // {
    //   icon: null,
    //   label: '',
    //   action: () => {},
    //   divider: true,
    // },
    {
      icon: SearchIcon,
      label: 'Search Note',
      action: () => {
        console.log('Search Note clicked')
        onClose()
      },
    },
    {
      icon: NewFolderIcon,
      label: 'New Folder',
      action: () => {
        console.log('New Folder clicked')
        onClose()
      },
      separator: true,
    },
    {
      title: 'Notes',
      isTitle: true,
    },
  ]

  return (
    <div
      className={`
        fixed top-0 left-0 h-screen bg-gray-50 border-r border-gray-200 overflow-hidden z-40
        ${isOpen ? 'w-80' : 'w-0'}
      `}
      style={{
        transition: shouldAnimate
          ? 'width 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
          : 'none',
        willChange: 'width',
      }}
    >
      <div className="w-80 h-full flex flex-col">
        {/* 侧边栏顶部 - 与导航栏平行的菜单图标 */}
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent transition-all duration-200"
            style={{
              transform: 'rotate(90deg)',
              willChange: 'transform',
            }}
          >
            <MenuIcon width={18} height={18} className="text-black" />
          </button>
        </div>

        {/* 侧边栏内容 */}
        <div className="px-6 pb-6 flex-1">
          <div className="space-y-1">
            {menuItems.map(item =>
              item.isTitle ? (
                // 渲染分组标题
                <h3
                  key={item.title}
                  className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6"
                >
                  {item.title}
                </h3>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-transparent hover:bg-gray-100 hover:border-gray-100 border-2 border-transparent text-gray-700 transition-all duration-200
                  ${item.separator ? 'mt-6' : ''}
                  `}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
