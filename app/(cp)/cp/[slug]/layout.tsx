'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { cpApi } from '@/lib/cp-api'

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
    cpApi.get(`/api/cp/workspaces/slug/${slug}`).then((res) => {
      const ws = res.data?.workspace
      if (!ws) return
      setContext({
        workspaceId:    ws.id,
        workspaceSlug:  ws.slug,
        organizationId: ws.organizationId,
        role:           ws.myRole ?? 'STAFF',
        memberId:       ws.myMemberId ?? '',
        workspaceName:  ws.name,
        workspaceLogo:  ws.logo,
      })
    }).catch(() => {})
  }, [slug, setContext])

  return <>{children}</>
}
