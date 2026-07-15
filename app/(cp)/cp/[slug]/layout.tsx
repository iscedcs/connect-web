'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { cpApi } from '@/lib/cp-api'
import type { CpRole } from '@/lib/types/cp'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const slug   = params?.slug as string
  const setContext = useCpWorkspaceStore((s) => s.setContext)

  useEffect(() => {
    if (!slug) return

    cpApi.get(`/api/cp/workspaces/slug/${slug}`).then(async (res) => {
      const ws = res.data?.workspace
      if (!ws) return

      // Fetch the current user's membership/role in this workspace
      let role: CpRole = 'STAFF'
      let memberId = ''
      let staffProfileId: string | undefined
      let clientId: string | undefined
      try {
        const meRes = await cpApi.get(
          `/api/cp/workspaces/${ws.id}/members/me`,
        )
        const me = meRes.data?.member ?? meRes.data
        role           = me?.role           ?? 'STAFF'
        memberId       = me?.id             ?? me?.memberId       ?? ''
        staffProfileId = me?.staffProfileId ?? undefined
        clientId       = me?.clientId       ?? undefined
      } catch {}

      setContext({
        workspaceId:    ws.id,
        workspaceSlug:  ws.slug,
        organizationId: ws.organizationId,
        role,
        memberId,
        staffProfileId,
        clientId,
        workspaceName:  ws.name,
        workspaceLogo:  ws.logo,
      })
    }).catch(() => {})
  }, [slug, setContext])

  return <>{children}</>
}
