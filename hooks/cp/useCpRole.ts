'use client'

import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import type { CpRole } from '@/lib/types/cp'

export function useCpRole() {
  const role = useCpWorkspaceStore((s) => s.role) as CpRole | undefined

  return {
    isCreator: role === 'CREATOR',
    isWorkspaceAdmin: role === 'WORKSPACE_ADMIN',
    isStaff: role === 'STAFF',
    isClient: role === 'CLIENT',
    canManageStaff: role === 'CREATOR' || role === 'WORKSPACE_ADMIN',
    canSeeAllClients: role === 'WORKSPACE_ADMIN' || role === 'CREATOR',
    canManageInvoices: role === 'CREATOR' || role === 'WORKSPACE_ADMIN',
    role,
  }
}
