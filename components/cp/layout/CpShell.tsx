import { CpBottomNav } from './CpBottomNav'
import { CpSidebar }   from './CpSidebar'
import { CpTopbar }    from './CpTopbar'
import { ComplianceBanner } from '@/components/cp/compliance/ComplianceBanner'

export function CpShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cp-bg)' }}>
      {/* Desktop sidebar */}
      <CpSidebar />

      {/* Main content area */}
      <div className="lg:ml-[240px] flex flex-col min-h-screen">
        <CpTopbar />

        {/* Outstanding KYC follows the user across every CP screen (ENG-424) */}
        <ComplianceBanner />

        <main
          className="flex-1 pb-20 lg:pb-8"
          style={{ maxWidth: 'var(--cp-max-content)' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <CpBottomNav />
    </div>
  )
}
