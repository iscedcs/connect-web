import { cn } from '@/lib/utils'

export type Status =
  | 'ACTIVE' | 'INACTIVE'
  | 'DRAFT' | 'SENT' | 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
  | 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED'
  | 'SUSPENDED' | 'NEW' | 'CONTACTED' | 'VALIDATED' | 'REJECTED'
  | 'ON_TIME' | 'LATE' | 'ABSENT' | 'AUTO' | 'CHECKED_IN' | 'CHECKED_OUT'
  | 'UNASSIGNED' | 'LOST'
  | (string & {})

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  ACTIVE:     { label: 'Active',      bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  INACTIVE:   { label: 'Inactive',    bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  DRAFT:      { label: 'Draft',       bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  SENT:       { label: 'Sent',        bg: 'bg-blue-500/15',             text: 'text-blue-400' },
  PAID:       { label: 'Paid',        bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  UNPAID:     { label: 'Unpaid',      bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  OVERDUE:    { label: 'Overdue',     bg: 'bg-red-500/15',              text: 'text-red-400' },
  CANCELLED:  { label: 'Cancelled',   bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  PENDING:    { label: 'Pending',     bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  CONFIRMED:  { label: 'Confirmed',   bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  SCHEDULED:  { label: 'Scheduled',   bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  COMPLETED:  { label: 'Completed',   bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  SUSPENDED:  { label: 'Suspended',   bg: 'bg-red-500/15',              text: 'text-red-400' },
  NEW:        { label: 'New',         bg: 'bg-blue-500/15',             text: 'text-blue-400' },
  CONTACTED:  { label: 'Contacted',   bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  VALIDATED:  { label: 'Validated',   bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  REJECTED:   { label: 'Rejected',    bg: 'bg-red-500/15',              text: 'text-red-400' },
  ON_TIME:    { label: 'On time',     bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  CHECKED_IN: { label: 'Checked In',  bg: 'bg-[var(--cp-primary,#10B981)]/15', text: 'text-[var(--cp-primary,#10B981)]' },
  CHECKED_OUT:{ label: 'Checked Out', bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  LATE:       { label: 'Late',        bg: 'bg-amber-500/15',            text: 'text-amber-400' },
  ABSENT:     { label: 'Absent',      bg: 'bg-red-500/15',              text: 'text-red-400' },
  AUTO:       { label: 'Auto',        bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  UNASSIGNED: { label: 'Unassigned',  bg: 'bg-[var(--cp-text-3,#555)]/15',  text: 'text-[var(--cp-text-3,#555)]' },
  LOST:       { label: 'Lost',        bg: 'bg-red-500/15',              text: 'text-red-400' },
}

interface Props {
  status: Status
  className?: string
}

export function CpStatusBadge({ status, className }: Props) {
  const cfg = statusConfig[status] ?? {
    label: status,
    bg:    'bg-[var(--cp-text-3,#555)]/15',
    text:  'text-[var(--cp-text-3,#555)]',
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
