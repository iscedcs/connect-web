'use client'

import * as React from 'react'
import { useMediaQuery } from '@/hooks/cp/useMediaQuery'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  variant?: 'auto' | 'modal' | 'bottom-sheet'
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = 'auto',
  className,
}: DialogProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isModal = variant === 'modal' || (variant === 'auto' && isDesktop)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Backdrop click to dismiss */}
      <div
        className="fixed inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Container */}
      <div
        className={cn(
          'relative z-10 w-full bg-[var(--cp-surface)] border border-[var(--cp-border)] shadow-xl overflow-hidden flex flex-col',
          isModal
            ? 'max-w-lg rounded-2xl max-h-[85vh] animate-in fade-in-0 zoom-in-95'
            : 'rounded-t-2xl max-h-[90vh] pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom-full',
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-4 border-b border-[var(--cp-border)]">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-[var(--cp-text-1)]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[var(--cp-text-2)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg text-[var(--cp-text-3)] hover:text-[var(--cp-text-1)] hover:bg-[var(--cp-surface-2)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
