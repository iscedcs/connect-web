import { cn } from '@/lib/utils'

interface CpEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function CpEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: CpEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--cp-surface-2)] flex items-center justify-center text-[var(--cp-text-3)]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--cp-text-1)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--cp-text-2)] max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
