import { CpBottomNav } from './CpBottomNav'
import { CpSidebar }   from './CpSidebar'
import { CpTopbar }    from './CpTopbar'

export function CpShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--cp-bg)' }}>
      {/* Desktop sidebar */}
      <CpSidebar />

      {/* Main content area */}
      <div className="lg:ml-[240px] flex flex-col min-h-screen">
        <CpTopbar />
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
