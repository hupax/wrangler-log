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
    } else {
      // 恢复滚动
      document.body.style.overflow = originalOverflowRef.current
    }

    // 清理函数：确保组件卸载时恢复滚动
    return () => {
      if (isLocked) {
        document.body.style.overflow = originalOverflowRef.current || ''
      }
    }
  }, [isLocked])

  // 组件卸载时的保险恢复
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
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
