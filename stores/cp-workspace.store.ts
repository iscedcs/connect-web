import { create } from 'zustand'
import type { CpRole } from '@/lib/types/cp'

export interface CpContext {
  workspaceId: string
  workspaceSlug: string
  organizationId: string
  role: CpRole
  memberId: string
  staffProfileId?: string
  clientId?: string
  workspaceName?: string
  workspaceLogo?: string
}

interface CpWorkspaceState extends Partial<CpContext> {
  setContext: (ctx: CpContext) => void
  clear: () => void
}

export const useCpWorkspaceStore = create<CpWorkspaceState>((set) => ({
  workspaceId: undefined,
  workspaceSlug: undefined,
  organizationId: undefined,
  role: undefined,
  memberId: undefined,
  staffProfileId: undefined,
  clientId: undefined,
  workspaceName: undefined,
  workspaceLogo: undefined,
  setContext: (ctx) => set({ ...ctx }),
  clear: () =>
    set({
      workspaceId: undefined,
      workspaceSlug: undefined,
      organizationId: undefined,
      role: undefined,
      memberId: undefined,
      staffProfileId: undefined,
      clientId: undefined,
      workspaceName: undefined,
      workspaceLogo: undefined,
    }),
}))
