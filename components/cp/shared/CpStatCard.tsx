import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface CpStatCardProps {
  value: string | number
  label: string
  trend?: number  // percentage, positive = up
  icon?: React.ReactNode
  accentColor?: 'green' | 'amber' | 'pink' | 'white'
  className?: string
}

export function CpStatCard({
  value,
  label,
  trend,
  icon,
  accentColor = 'green',
  className,
}: CpStatCardProps) {
  const valueColor =
    accentColor === 'green' ? 'text-[var(--cp-primary)]' :
    accentColor === 'amber' ? 'text-amber-400' :
    accentColor === 'pink'  ? 'text-[var(--cp-accent)]' :
    'text-[var(--cp-text-1)]'

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-xl p-4 flex flex-col gap-1',
        'bg-[var(--cp-surface)] min-w-[96px] lg:min-w-0',
        className,
      )}
    >
      {icon && (
        <div className="mb-1 text-[var(--cp-primary)]">{icon}</div>
      )}
      <span className={cn('text-2xl font-bold leading-none', valueColor)}>
        {value}
      </span>
      <span className="text-xs text-[var(--cp-text-2)] leading-tight">{label}</span>
      {trend !== undefined && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trend >= 0 ? 'text-[var(--cp-primary)]' : 'text-[var(--cp-accent)]',
          )}
        >
          {trend >= 0 ? (
            <TrendingUp size={12} />
          ) : (
            <TrendingDown size={12} />
          )}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  )
}
