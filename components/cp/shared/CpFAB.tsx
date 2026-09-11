'use client'

import { cn } from '@/lib/utils'

interface CpFABProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
  className?: string
}

export function CpFAB({ onClick, icon, label, className }: CpFABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label ?? 'Action'}
      className={cn(
        'fixed bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] right-4',
        'lg:bottom-8 lg:right-8',
        'z-40 flex items-center justify-center',
        'w-14 h-14 rounded-full shadow-lg',
        'bg-[var(--cp-primary)] text-white',
        'hover:bg-[var(--cp-primary)]/90 active:scale-95 transition-all',
        className,
      )}
    >
      {icon ?? <span className="text-2xl font-light leading-none">+</span>}
    </button>
  )
}
