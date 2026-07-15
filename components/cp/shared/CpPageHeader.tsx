'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CpPageHeaderProps {
  title: string
  backHref?: string
  rightAction?: React.ReactNode
  className?: string
}

export function CpPageHeader({
  title,
  backHref,
  rightAction,
  className,
}: CpPageHeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 lg:hidden',
        'sticky top-0 z-20',
        className,
      )}
      style={{
        height: 56,
        background: 'var(--cp-bg)',
        borderBottom: '1px solid var(--cp-border)',
      }}
    >
      {backHref && (
        <button
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="p-1.5 -ml-1 rounded-lg hover:bg-[var(--cp-surface-2)] text-[var(--cp-text-2)]"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-[var(--cp-text-1)] truncate">
        {title}
      </h1>
      {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
    </header>
  )
}
