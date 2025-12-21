import { type ModalAction, type PrpPprAction } from '@constants'
import type { Platform, PlatformProfileRole, PlatformRolePermission } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PlatformState {
  isPlatformModalOpen: boolean
  platformModalAction: ModalAction | null
  selectedStatus: string
  isIncludeDeleted: boolean
  selectedPlatform: Platform | null
  isShowHistory: boolean
  isPrpModalOpen: boolean
  isPprModalOpen: boolean
  selectedPrp: PlatformRolePermission | null
  selectedPpr: PlatformProfileRole | null
  prpModalAction: PrpPprAction | null
  pprModalAction: PrpPprAction | null

  setSelectedStatus: (v: string) => void
  setIncludeDeleted: (v: boolean) => void
  setSelectedPlatform: (p: Platform | null) => void
  openPlatformModal: (action: ModalAction, platform?: Platform | null) => void
  closePlatformModal: () => void
  openPrpModal: (action: PrpPprAction, prp?: PlatformRolePermission | null) => void
  closePrpModal: () => void
  openPprModal: (action: PrpPprAction, ppr?: PlatformProfileRole | null) => void
  closePprModal: () => void
  setShowHistory: (v: boolean) => void

  resetPlatformState: () => void
}

export const usePlatformStore = create<PlatformState>()(
  devtools(
    (set) => ({
      isPlatformModalOpen: false,
      platformModalAction: null,
      selectedStatus: 'all',
      isIncludeDeleted: false,
      selectedPlatform: null,
      isShowHistory: false,
      isPrpModalOpen: false,
      isPprModalOpen: false,
      selectedPrp: null,
      selectedPpr: null,
      prpModalAction: null,
      pprModalAction: null,

      setSelectedStatus: (v) => set({ selectedStatus: v }, false, 'platform/setSelectedStatus'),

      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }, false, 'platform/setIncludeDeleted'),

      setSelectedPlatform: (p) => set({ selectedPlatform: p }, false, 'platform/setSelectedPlatform'),

      openPlatformModal: (action, platform = null) =>
        set(
          {
            isPlatformModalOpen: true,
            platformModalAction: action,
            selectedPlatform: platform,
          },
          false,
          'platform/openPlatformModal',
        ),

      closePlatformModal: () =>
        set(
          {
            isPlatformModalOpen: false,
            platformModalAction: null,
            selectedPlatform: null,
          },
          false,
          'platform/closePlatformModal',
        ),

      openPrpModal: (action, prp = null) =>
        set({ isPrpModalOpen: true, prpModalAction: action, selectedPrp: prp }, false, 'platform/openPrpModal'),

      closePrpModal: () =>
        set({ isPrpModalOpen: false, prpModalAction: null, selectedPrp: null }, false, 'platform/closePrpModal'),

      openPprModal: (action, ppr = null) =>
        set({ isPprModalOpen: true, pprModalAction: action, selectedPpr: ppr }, false, 'platform/openPprModal'),

      closePprModal: () =>
        set({ isPprModalOpen: false, pprModalAction: null, selectedPpr: null }, false, 'platform/closePprModal'),

      setShowHistory: (v) => set({ isShowHistory: v }, false, 'platform/setShowHistory'),

      resetPlatformState: () =>
        set(
          {
            isPlatformModalOpen: false,
            platformModalAction: null,
            selectedStatus: 'all',
            isIncludeDeleted: false,
            selectedPlatform: null,
            isShowHistory: false,
            isPrpModalOpen: false,
            isPprModalOpen: false,
            selectedPrp: null,
            selectedPpr: null,
            prpModalAction: null,
            pprModalAction: null,
          },
          false,
          'platform/resetPlatformState',
        ),
    }),
    {
      name: 'PlatformStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
