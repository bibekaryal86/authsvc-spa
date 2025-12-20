import { type ModalActionExtended, type PrpPprAction } from '@constants'
import type { Profile, PlatformProfileRole } from '@types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProfileState {
  isProfileModalOpen: boolean
  profileModalAction: ModalActionExtended | null
  selectedStatus: string
  selectedPlatform: string
  isIncludeDeleted: boolean
  selectedProfile: Profile | null
  isShowHistory: boolean
  isPprModalOpen: boolean
  selectedPpr: PlatformProfileRole | null
  pprModalAction: PrpPprAction | null

  setSelectedStatus: (v: string) => void
  setSelectedPlatform: (v: string) => void
  setIncludeDeleted: (v: boolean) => void
  setSelectedProfile: (p: Profile | null) => void
  openProfileModal: (action: ModalActionExtended, profile?: Profile | null) => void
  closeProfileModal: () => void
  openPprModal: (action: PrpPprAction, ppr?: PlatformProfileRole | null) => void
  closePprModal: () => void
  setShowHistory: (v: boolean) => void

  resetProfileState: () => void
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      isProfileModalOpen: false,
      profileModalAction: null,
      selectedStatus: 'all',
      selectedPlatform: 'all',
      isIncludeDeleted: false,
      selectedProfile: null,
      isShowHistory: false,
      isPprModalOpen: false,
      selectedPpr: null,
      pprModalAction: null,

      setSelectedStatus: (v) => set({ selectedStatus: v }),
      setSelectedPlatform: (v) => set({ selectedPlatform: v }),
      setIncludeDeleted: (v) => set({ isIncludeDeleted: v }),
      setSelectedProfile: (p) => set({ selectedProfile: p }),
      openProfileModal: (action, profile = null) =>
        set({ isProfileModalOpen: true, profileModalAction: action, selectedProfile: profile }),
      closeProfileModal: () => set({ isProfileModalOpen: false, profileModalAction: null, selectedProfile: null }),
      openPprModal: (action, ppr = null) => set({ isPprModalOpen: true, pprModalAction: action, selectedPpr: ppr }),
      closePprModal: () => set({ isPprModalOpen: false, pprModalAction: null, selectedPpr: null }),
      setShowHistory: (v) => set({ isShowHistory: v }),

      resetProfiles: () =>
        set(
          {
            isProfileModalOpen: false,
            profileModalAction: null,
            selectedStatus: 'all',
            selectedPlatform: 'all',
            isIncludeDeleted: false,
            selectedProfile: null,
            isShowHistory: false,
            isPprModalOpen: false,
            selectedPpr: null,
            pprModalAction: null,
          },
          false,
          'profile/resetProfiles',
        ),
    }),
    {
      name: 'ProfileStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
