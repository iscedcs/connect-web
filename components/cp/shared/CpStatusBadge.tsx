import { cn } from '@/lib/utils'

type Status =
  | 'ACTIVE' | 'INACTIVE'
  | 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  | 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  | 'SUSPENDED' | 'NEW' | 'CONTACTED' | 'VALIDATED' | 'REJECTED'
  | 'ON_TIME' | 'LATE' | 'ABSENT' | 'AUTO'
  | 'UNASSIGNED' | 'LOST'

const statusConfig: Record<
  Status,
  { label: string; bg: string; text: string }
> = {
  ACTIVE:     { label: 'Active',      bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  INACTIVE:   { label: 'Inactive',    bg: 'bg-[var(--cp-text-3)]/15',  text: 'text-[var(--cp-text-3)]' },
  DRAFT:      { label: 'Draft',       bg: 'bg-[var(--cp-text-3)]/15',  text: 'text-[var(--cp-text-3)]' },
  SENT:       { label: 'Sent',        bg: 'bg-blue-500/15',             text: 'text-blue-400' },
  PAID:       { label: 'Paid',        bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  OVERDUE:    { label: 'Overdue',     bg: 'bg-[var(--cp-accent)]/15',  text: 'text-[var(--cp-accent)]' },
  CANCELLED:  { label: 'Cancelled',   bg: 'bg-[var(--cp-text-3)]/15',  text: 'text-[var(--cp-text-3)]' },
  PENDING:    { label: 'Pending',     bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  CONFIRMED:  { label: 'Confirmed',   bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  COMPLETED:  { label: 'Completed',   bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  SUSPENDED:  { label: 'Suspended',   bg: 'bg-red-500/15',              text: 'text-red-400' },
  NEW:        { label: 'New',         bg: 'bg-blue-500/15',             text: 'text-blue-400' },
  CONTACTED:  { label: 'Contacted',   bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  VALIDATED:  { label: 'Validated',   bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  REJECTED:   { label: 'Rejected',    bg: 'bg-red-500/15',              text: 'text-red-400' },
  ON_TIME:    { label: 'On time',     bg: 'bg-[var(--cp-primary)]/15', text: 'text-[var(--cp-primary)]' },
  LATE:       { label: 'Late',        bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  ABSENT:     { label: 'Absent',      bg: 'bg-[var(--cp-accent)]/15',  text: 'text-[var(--cp-accent)]' },
  AUTO:       { label: 'Auto',        bg: 'bg-[var(--cp-text-3)]/15',  text: 'text-[var(--cp-text-3)]' },
  UNASSIGNED: { label: 'Unassigned',  bg: 'bg-[var(--cp-text-3)]/15',  text: 'text-[var(--cp-text-3)]' },
  LOST:       { label: 'Lost',        bg: 'bg-red-500/15',              text: 'text-red-400' },
}

interface Props {
  status: Status
  className?: string
}

export function CpStatusBadge({ status, className }: Props) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg:    'bg-[var(--cp-text-3)]/15',
    text:  'text-[var(--cp-text-3)]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      {cfg.label}
    </span>
  )
}
