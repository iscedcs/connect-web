import React from 'react'

export const metadata = {
  title: 'ISCE Connect Plus',
  description: 'Enterprise & Business Operations Layer for ISCE Connect',
}

export default function ConnectPlusRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--cp-bg,#0D0D0D)] text-[var(--cp-text-1,#FFFFFF)] antialiased">
      {children}
    </div>
  )
}
