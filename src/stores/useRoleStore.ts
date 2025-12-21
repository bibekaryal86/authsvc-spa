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
  prpModalAction: PrpPprAction | null
  pprModalAction: PrpPprAction | null

  setSelectedStatus: (v: string) => void
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
      prpModalAction: null,
      pprModalAction: null,

      setSelectedStatus: (v) => set({ selectedStatus: v }, false, 'role/setSelectedStatus'),

      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }, false, 'role/setIncludeDeleted'),

      setSelectedRole: (p) => set({ selectedRole: p }, false, 'role/setSelectedRole'),

      openRoleModal: (action, role = null) =>
        set(
          {
            isRoleModalOpen: true,
            roleModalAction: action,
            selectedRole: role,
          },
          false,
          'role/openRoleModal',
        ),

      closeRoleModal: () =>
        set(
          {
            isRoleModalOpen: false,
            roleModalAction: null,
            selectedRole: null,
          },
          false,
          'role/closeRoleModal',
        ),

      openPrpModal: (action, prp = null) =>
        set({ isPrpModalOpen: true, prpModalAction: action, selectedPrp: prp }, false, 'role/openPrpModal'),

      closePrpModal: () =>
        set({ isPrpModalOpen: false, prpModalAction: null, selectedPrp: null }, false, 'role/closePrpModal'),

      openPprModal: (action, ppr = null) =>
        set({ isPprModalOpen: true, pprModalAction: action, selectedPpr: ppr }, false, 'role/openPprModal'),

      closePprModal: () =>
        set({ isPprModalOpen: false, pprModalAction: null, selectedPpr: null }, false, 'role/closePprModal'),

      setShowHistory: (v) => set({ isShowHistory: v }, false, 'role/setShowHistory'),

      resetRoleState: () =>
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
            prpModalAction: null,
            pprModalAction: null,
          },
          false,
          'role/resetRoleState',
        ),
    }),
    {
      name: 'RoleStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
