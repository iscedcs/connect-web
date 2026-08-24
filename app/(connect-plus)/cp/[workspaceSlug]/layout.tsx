'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { cpApi } from '@/lib/cp-api'
import { URLS } from '@/lib/const'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { CpShell } from '@/components/cp/layout/CpShell'
import type { CpWorkspace } from '@/lib/types/cp'

export default function WorkspaceSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const router = useRouter()
  const slug = params?.workspaceSlug as string
  const [loading, setLoading] = useState(true)
  const setContext = useCpWorkspaceStore((s) => s.setContext)

  useEffect(() => {
    if (!slug) return

    let isMounted = true
    setLoading(true)

    Promise.all([
      cpApi.get<any>(URLS.workspaces.my_workspaces).catch(() => ({ data: [] })),
      cpApi.get<any>(URLS.organization.one).catch(() => ({ data: {} })),
    ])
      .then(([wsRes, orgRes]) => {
        if (!isMounted) return

        const map = new Map<string, CpWorkspace>()

        const orgObj = orgRes.data?.organization || orgRes.data || {}
        const orgWorkspacesArray = Array.isArray(orgObj.workspaces)
          ? orgObj.workspaces
          : []

        for (const item of orgWorkspacesArray) {
          if (item && item.id) {
            map.set(item.id, {
              id: item.id,
              name: item.name,
              slug: item.slug || item.id,
              status: item.status || 'ACTIVE',
              organizationId: orgObj.id || item.organizationId || '',
              category: item.category || 'General',
              role: 'CREATOR',
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
            })
          }
        }

        const myWorkspacesArray = Array.isArray(wsRes.data)
          ? wsRes.data
          : wsRes.data?.workspaces || wsRes.data?.data || []

        for (const item of myWorkspacesArray) {
          const ws = item.workspace ? item.workspace : item
          if (ws && ws.id) {
            const existing = map.get(ws.id)
            map.set(ws.id, {
              ...(existing || ws),
              ...ws,
              role: item.role || existing?.role || 'CREATOR',
              memberId: item.memberId || existing?.memberId,
            })
          }
        }

        const workspaces = Array.from(map.values())
        const matched = workspaces.find((w) => w.slug === slug || w.id === slug)

        if (matched) {
          setContext({
            workspaceId: matched.id,
            workspaceSlug: matched.slug || slug,
            organizationId: matched.organizationId || '',
            role: matched.role || 'WORKSPACE_ADMIN',
            memberId: matched.memberId || '',
            workspaceName: matched.name,
            workspaceLogo: matched.logo,
          })
        } else if (workspaces.length > 0) {
          const first = workspaces[0]
          setContext({
            workspaceId: first.id,
            workspaceSlug: first.slug || slug,
            organizationId: first.organizationId || '',
            role: first.role || 'WORKSPACE_ADMIN',
            memberId: first.memberId || '',
            workspaceName: first.name,
            workspaceLogo: first.logo,
          })
        }
      })
      .catch((err) => {
        console.error('Failed to resolve workspace context:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug, setContext])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--cp-bg,#0D0D0D)] text-[var(--cp-text-2,#888888)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--cp-primary,#10B981)] border-t-transparent" />
          <p className="text-sm">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return <CpShell>{children}</CpShell>
}
