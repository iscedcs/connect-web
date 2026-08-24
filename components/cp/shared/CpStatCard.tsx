import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CpStatCardProps {
  value: string | number
  label?: string
  title?: string
  subtitle?: string
  trend?: number
  icon?: any
  accent?: string
  accentColor?: string
  className?: string
}

export function CpStatCard({
  value,
  label,
  title,
  subtitle,
  trend,
  icon: Icon,
  accent,
  accentColor = 'green',
  className,
}: CpStatCardProps) {
  const displayLabel = title || label || ''
  const effectiveAccent = accent || accentColor

  const valueColor =
    effectiveAccent === 'green'
      ? 'text-[var(--cp-primary,#10B981)]'
      : effectiveAccent === 'amber'
      ? 'text-amber-400'
      : effectiveAccent === 'purple'
      ? 'text-purple-400'
      : effectiveAccent === 'blue'
      ? 'text-blue-400'
      : effectiveAccent === 'pink'
      ? 'text-pink-400'
      : 'text-[var(--cp-text-1,#FFF)]'

  return (
    <div
      className={cn(
        'p-5 rounded-2xl bg-[var(--cp-surface,#141414)] border border-[var(--cp-border,#222)] flex flex-col justify-between space-y-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--cp-text-2,#888)] uppercase tracking-wider">
          {displayLabel}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-primary,#10B981)]">
            {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
          </div>
        )}
      </div>

      <div>
        <div className={cn('text-2xl lg:text-3xl font-extrabold tracking-tight', valueColor)}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] text-[var(--cp-text-3,#666)] mt-1 font-medium">{subtitle}</p>
        )}
      </div>

      {trend !== undefined && (
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-semibold pt-1',
            trend >= 0 ? 'text-[var(--cp-primary,#10B981)]' : 'text-red-400',
          )}
        >
          {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  )
}
