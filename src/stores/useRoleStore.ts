import { type ModalAction, type PrpPprAction } from '@constants'
import type { Role, PlatformProfileRole, PlatformRolePermission } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RoleState {
  isRoleModalOpen: boolean
  roleModalAction: ModalAction | null
  selectedStatus: string
  isIncludeDeleted: boolean
  selectedRole: Role | null
  isShowHistory: boolean
  isPrpModalOpen: boolean
  isPprModalOpen: boolean
  selectedPrp: PlatformRolePermission | null
  selectedPpr: PlatformProfileRole | null
  prpPprModalAction: PrpPprAction | null

  setSelectedStatus: (v: string) => void
  setSelectedPlatform: (v: string) => void
  setIncludeDeleted: (v: boolean) => void
  setSelectedRole: (p: Role | null) => void
  openRoleModal: (action: ModalAction, role?: Role | null) => void
  closeRoleModal: () => void
  openPrpModal: (action: PrpPprAction, prp?: PlatformRolePermission | null) => void
  closePrpModal: () => void
  openPprModal: (action: PrpPprAction, ppr?: PlatformProfileRole | null) => void
  closePprModal: () => void
  setShowHistory: (v: boolean) => void

  resetRoleState: () => void
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set) => ({
      isRoleModalOpen: false,
      roleModalAction: null,
      selectedStatus: 'all',
      isIncludeDeleted: false,
      selectedRole: null,
      isShowHistory: false,
      isPrpModalOpen: false,
      isPprModalOpen: false,
      selectedPrp: null,
      selectedPpr: null,
      prpPprModalAction: null,

      setSelectedStatus: (v) => set({ selectedStatus: v }),
      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }),
      setSelectedRole: (p) => set({ selectedRole: p }),
      openRoleModal: (action, role = null) =>
        set({ isRoleModalOpen: true, roleModalAction: action, selectedRole: role }),
      closeRoleModal: () => set({ isRoleModalOpen: false, roleModalAction: null, selectedRole: null }),
      openPrpModal: (action, prp = null) => set({ isPrpModalOpen: true, prpPprModalAction: action, selectedPrp: prp }),
      closePrpModal: () => set({ isPrpModalOpen: false, prpPprModalAction: null, selectedPrp: null }),
      openPprModal: (action, ppr = null) => set({ isPprModalOpen: true, prpPprModalAction: action, selectedPpr: ppr }),
      closePprModal: () => set({ isPprModalOpen: false, prpPprModalAction: null, selectedPpr: null }),

      setShowHistory: (v) => set({ isShowHistory: v }),

      resetRoles: () =>
        set(
          {
            isRoleModalOpen: false,
            roleModalAction: null,
            selectedStatus: 'all',
            isIncludeDeleted: false,
            selectedRole: null,
            isShowHistory: false,
            isPrpModalOpen: false,
            isPprModalOpen: false,
            selectedPrp: null,
            selectedPpr: null,
            prpPprModalAction: null,
          },
          false,
          'role/resetRoles',
        ),
    }),
    {
      name: 'RoleStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
