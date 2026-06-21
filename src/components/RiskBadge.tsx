import type { RiskLevel } from '@/types'
import { cn } from '@/lib/utils'

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string; dot: string; pulse: string }> = {
  red: {
    bg: 'bg-risk-redBg',
    text: 'text-risk-red',
    label: '高风险',
    dot: 'bg-risk-red',
    pulse: 'animate-pulse-slow',
  },
  yellow: {
    bg: 'bg-risk-yellowBg',
    text: 'text-risk-yellow',
    label: '关注',
    dot: 'bg-risk-yellow',
    pulse: '',
  },
  green: {
    bg: 'bg-risk-greenBg',
    text: 'text-risk-green',
    label: '正常',
    dot: 'bg-risk-green',
    pulse: '',
  },
}

interface RiskBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  dotOnly?: boolean
  className?: string
}

export function RiskBadge({ level, size = 'sm', showLabel = true, dotOnly = false, className }: RiskBadgeProps) {
  const config = riskConfig[level]

  if (dotOnly) {
    return (
      <span className={cn('inline-block rounded-full', config.dot, config.pulse, className, {
        'w-2 h-2': size === 'sm',
        'w-2.5 h-2.5': size === 'md',
        'w-3 h-3': size === 'lg',
      })} />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg,
        config.text,
        className,
        {
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-xs': size === 'md',
          'px-3 py-1.5 text-sm': size === 'lg',
        }
      )}
    >
      <span className={cn('rounded-full', config.dot, config.pulse, {
        'w-1.5 h-1.5': size === 'sm',
        'w-2 h-2': size === 'md',
        'w-2.5 h-2.5': size === 'lg',
      })} />
      {showLabel && config.label}
    </span>
  )
}

export function formatMoney(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(value % 10000 === 0 ? 0 : 1) + '万'
  }
  return value.toLocaleString('zh-CN')
}

export function formatMoneyFull(value: number): string {
  return value.toLocaleString('zh-CN')
}

export function formatYoY(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
