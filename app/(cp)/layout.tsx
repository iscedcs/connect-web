import { CpShell } from '@/components/cp/layout/CpShell'

export default function CpLayout({ children }: { children: React.ReactNode }) {
  return <CpShell>{children}</CpShell>
}
