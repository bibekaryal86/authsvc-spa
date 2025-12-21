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

      setSelectedStatus: (v) => set({ selectedStatus: v }, false, 'permission/setSelectedStatus'),

      setSelectedPlatform: (v) => set({ selectedPlatform: v }, false, 'permission/setSelectedPlatform'),

      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }, false, 'permission/setIncludeDeleted'),

      setSelectedPermission: (p) => set({ selectedPermission: p }, false, 'permission/setSelectedPermission'),

      openPermissionModal: (action, permission = null) =>
        set(
          {
            isPermissionModalOpen: true,
            permissionModalAction: action,
            selectedPermission: permission,
          },
          false,
          'permission/openPermissionModal',
        ),

      closePermissionModal: () =>
        set(
          {
            isPermissionModalOpen: false,
            permissionModalAction: null,
            selectedPermission: null,
          },
          false,
          'permission/closePermissionModal',
        ),

      openPrpModal: (action, prp = null) =>
        set({ isPrpModalOpen: true, prpModalAction: action, selectedPrp: prp }, false, 'permission/openPrpModal'),

      closePrpModal: () =>
        set({ isPrpModalOpen: false, prpModalAction: null, selectedPrp: null }, false, 'permission/closePrpModal'),

      setShowHistory: (v) => set({ isShowHistory: v }, false, 'permission/setShowHistory'),

      resetPermissionState: () =>
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
          'permission/resetPermissionState',
        ),
    }),
    {
      name: 'PermissionStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
