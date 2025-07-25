import { useEffect, useRef } from 'react'

interface UseScrollLockOptions {
  isLocked: boolean
}

/**
 * 管理页面滚动锁定的Hook
 * 确保滚动状态的正确恢复，避免因组件卸载导致的滚动问题
 */
export function useScrollLock({ isLocked }: UseScrollLockOptions) {
  const originalOverflowRef = useRef<string>('')

  useEffect(() => {
    if (isLocked) {
      // 保存当前的overflow状态
      originalOverflowRef.current = document.body.style.overflow || ''

      // 锁定滚动
      document.body.style.overflow = 'hidden'

      // 添加调试日志
      if (process.env.NODE_ENV === 'development') {
        console.debug('🔒 Scroll locked')
      }
    } else {
      // 恢复滚动
      document.body.style.overflow = originalOverflowRef.current

      // 添加调试日志
      if (process.env.NODE_ENV === 'development') {
        console.debug('🔓 Scroll unlocked')
      }
    }

    // 清理函数：确保组件卸载时恢复滚动
    return () => {
      if (isLocked) {
        document.body.style.overflow = originalOverflowRef.current || ''
        if (process.env.NODE_ENV === 'development') {
          console.debug('🔧 Scroll restored on cleanup')
        }
      }
    }
  }, [isLocked])

  // 组件卸载时的保险恢复
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      if (process.env.NODE_ENV === 'development') {
        console.debug('🚀 Scroll fully restored on unmount')
      }
    }
  }, [])
}

/**
 * 简化版本：仅在组件存在期间锁定滚动
 */
export function useScrollLockWhileMounted() {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow || ''
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])
}

/**
 * 开发环境下的滚动状态检测器
 */
export function useScrollDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const checkScrollStatus = () => {
      const overflow = document.body.style.overflow
      const canScroll = document.body.scrollHeight > window.innerHeight

      console.debug('📊 Scroll Status:', {
        overflow: overflow || 'default',
        canScroll,
        bodyHeight: document.body.scrollHeight,
        windowHeight: window.innerHeight
      })
    }

    // 定期检查滚动状态
    const interval = setInterval(checkScrollStatus, 2000)

    // 也可以手动触发检查
    window.checkScrollStatus = checkScrollStatus

    return () => {
      clearInterval(interval)
      delete window.checkScrollStatus
    }
  }, [])
}
