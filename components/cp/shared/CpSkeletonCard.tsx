import { cn } from '@/lib/utils'

interface CpSkeletonCardProps {
  lines?: number
  className?: string
}

export function CpSkeletonCard({ lines = 3, className }: CpSkeletonCardProps) {
  return (
    <div
      className={cn('rounded-xl p-4 space-y-3 bg-[var(--cp-surface)] animate-pulse', className)}
    >
      <div className="h-4 bg-[var(--cp-surface-2)] rounded w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-3 bg-[var(--cp-surface-2)] rounded w-1/2" />
      ))}
    </div>
  )
}

export function CpSkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3 px-4 animate-pulse',
        className,
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[var(--cp-surface-2)] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[var(--cp-surface-2)] rounded w-2/5" />
        <div className="h-2 bg-[var(--cp-surface-2)] rounded w-1/3" />
      </div>
    </div>
  )
}
