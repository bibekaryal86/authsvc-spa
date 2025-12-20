import { type ModalAction, type PrpPprAction } from '@constants'
import type { Permission, PlatformRolePermission } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PermissionState {
  isPermissionModalOpen: boolean
  permissionModalAction: ModalAction | null
  selectedStatus: string
  selectedPlatform: string
  isIncludeDeleted: boolean
  selectedPermission: Permission | null
  isShowHistory: boolean
  isPrpModalOpen: boolean
  selectedPrp: PlatformRolePermission | null
  prpModalAction: PrpPprAction | null

  setSelectedStatus: (v: string) => void
  setSelectedPlatform: (v: string) => void
  setIncludeDeleted: (v: boolean) => void
  setSelectedPermission: (p: Permission | null) => void
  openPermissionModal: (action: ModalAction, permission?: Permission | null) => void
  closePermissionModal: () => void
  openPrpModal: (action: PrpPprAction, prp?: PlatformRolePermission | null) => void
  closePrpModal: () => void
  setShowHistory: (v: boolean) => void

  resetPermissionState: () => void
}

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set) => ({
      isPermissionModalOpen: false,
      permissionModalAction: null,
      selectedStatus: 'all',
      selectedPlatform: 'all',
      isIncludeDeleted: false,
      selectedPermission: null,
      isShowHistory: false,
      isPrpModalOpen: false,
      selectedPrp: null,
      prpModalAction: null,

      setSelectedStatus: (v) => set({ selectedStatus: v }),
      setSelectedPlatform: (v) => set({ selectedPlatform: v }),
      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }),
      setSelectedPermission: (p) => set({ selectedPermission: p }),
      openPermissionModal: (action, permission = null) =>
        set({ isPermissionModalOpen: true, permissionModalAction: action, selectedPermission: permission }),
      closePermissionModal: () =>
        set({ isPermissionModalOpen: false, permissionModalAction: null, selectedPermission: null }),
      openPrpModal: (action, prp = null) => set({ isPrpModalOpen: true, prpModalAction: action, selectedPrp: prp }),
      closePrpModal: () => set({ isPrpModalOpen: false, prpModalAction: null, selectedPrp: null }),
      setShowHistory: (v) => set({ isShowHistory: v }),

      resetPermissions: () =>
        set(
          {
            isPermissionModalOpen: false,
            permissionModalAction: null,
            selectedStatus: 'all',
            selectedPlatform: 'all',
            isIncludeDeleted: false,
            selectedPermission: null,
            isShowHistory: false,
            isPrpModalOpen: false,
            selectedPrp: null,
            prpModalAction: null,
          },
          false,
          'permission/resetPermissions',
        ),
    }),
    {
      name: 'PermissionStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
