'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CpPageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  backHref?: string
  rightAction?: React.ReactNode
  className?: string
}

export function CpPageHeader({
  title,
  subtitle,
  description,
  backHref,
  rightAction,
  className,
}: CpPageHeaderProps) {
  const router = useRouter()
  const subText = subtitle || description

  return (
    <header className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {backHref && (
            <button
              onClick={() => (backHref ? router.push(backHref) : router.back())}
              className="p-1.5 -ml-1 rounded-lg hover:bg-[var(--cp-surface-2,#1A1A1A)] text-[var(--cp-text-2,#888)]"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-[var(--cp-text-1,#FFF)] tracking-tight">
              {title}
            </h1>
            {subText && (
              <p className="text-xs text-[var(--cp-text-2,#888888)] mt-0.5 font-normal">
                {subText}
              </p>
            )}
          </div>
        </div>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </header>
  )
}
