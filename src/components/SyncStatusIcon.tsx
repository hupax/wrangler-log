'use client'

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncIcon,
  CloudUploadIcon,
} from '@/components/icons'

interface SyncStatusIconProps {
  status?: 'synced' | 'pending' | 'conflict' | 'error' | 'not_synced'
  size?: number
  showText?: boolean
}

export default function SyncStatusIcon({
  status = 'not_synced',
  size = 16,
  showText = false,
}: SyncStatusIconProps) {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'synced':
        return {
          icon: '✅',
          color: 'text-green-500',
          text: '已同步',
          title: '已同步到 GitHub',
        }
      case 'pending':
        return {
          icon: '⏳',
          color: 'text-yellow-500',
          text: '同步中',
          title: '正在同步到 GitHub',
        }
      case 'conflict':
        return {
          icon: '⚠️',
          color: 'text-red-500',
          text: '冲突',
          title: '存在同步冲突',
        }
      case 'error':
        return {
          icon: '❌',
          color: 'text-red-500',
          text: '错误',
          title: '同步失败',
        }
      default:
        return {
          icon: '☁️',
          color: 'text-gray-400',
          text: '未同步',
          title: '未同步到 GitHub',
        }
    }
  }

  const { icon, color, text, title } = getStatusInfo(status)

  return (
    <div className="flex items-center gap-1" title={title}>
      <span className={`text-xs ${color}`} style={{ fontSize: `${size}px` }}>
        {icon}
      </span>
      {showText && <span className={`text-xs ${color}`}>{text}</span>}
    </div>
  )
}
