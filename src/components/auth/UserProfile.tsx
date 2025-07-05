'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotesStore } from '@/lib/store'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import {
  UserProfileIcon,
  UpgradePlanIcon,
  CustomSettingsIcon,
  SettingsIcon,
  HelpIcon,
  RightArrowIcon,
  LogoutIcon,
  GitHubIcon,
} from '@/components/icons'

export default function UserProfile() {
  const { user, signOut: signOutFromStore } = useNotesStore()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      signOutFromStore()
      setIsOpen(false)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Open profile menu"
        data-testid="profile-button"
        className="group user-select-none ps-2 focus-visible:outline-0"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="group-hover:bg-gray-100 touch:h-10 touch:w-10 flex h-9 w-9 items-center justify-center rounded-full group-focus-visible:ring-2 transition-colors">
          <div className="flex overflow-hidden rounded-full select-none bg-gray-500/30 h-6 w-6 shrink-0 cursor-pointer ">
            <img
              src={user?.photoURL || ''}
              alt="Profile image"
              className="h-6 w-6 shrink-0"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed z-50"
          style={{
            left: '0px',
            top: '0px',
            transform: 'translate(calc(100vw - 280px - 1rem), 48px)',
            minWidth: 'max-content',
          }}
        >
          <div
            role="menu"
            aria-orientation="vertical"
            className="z-50 max-w-xs rounded-2xl bg-white dark:bg-[#353535] shadow-xl border border-gray-200 dark:border-gray-600 py-1.5 min-w-[280px] max-h-[95vh] overflow-y-auto select-none animate-slideUpAndFade"
            tabIndex={-1}
          >
            <div className="flex flex-col">
              {/* 用户信息 */}
              <div className="px-1">
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center w-5 h-5">
                    <UserProfileIcon className="w-5 h-5" />
                  </div>
                  <div className="flex min-w-0 grow items-center gap-2.5">
                    <div className="truncate text-sm">{user?.email}</div>
                  </div>
                </div>
              </div>

              {/* 升级计划 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <UpgradePlanIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    升级计划
                  </span>
                </div>
              </div>

              {/* 自定义设置 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <CustomSettingsIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    自定义设置
                  </span>
                </div>
              </div>

              {/* 设置 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    设置
                  </span>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="bg-gray-200 dark:bg-gray-600 h-px mx-4 my-1"></div>

              {/* 帮助 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                      <HelpIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      帮助
                    </span>
                  </div>
                  <RightArrowIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* 登出 */}
              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <LogoutIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    登出
                  </span>
                </div>
              </div>

              <div className="px-1">
                <div
                  role="menuitem"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  onClick={() => {
                    // 这里可以打开 GitHub 设置页面或模态框
                    window.open('/github-settings', '_blank')
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-center justify-center w-5 h-5 text-gray-700 dark:text-gray-300">
                    <GitHubIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    GitHub 集成
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
