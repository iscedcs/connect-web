import React from 'react'

export const metadata = {
  title: 'LYNCON Plus',
  description: 'Enterprise & Business Operations Layer for LYNCON',
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
