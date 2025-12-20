import { DEFAULT_PARAMS } from '@constants'
import { profileService } from '@services'
import type { Profile, RequestMetadata } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ProfileState {
  profiles: Profile[]
  isLoading: boolean
  error: string | null

  setProfiles: (profiles: Profile[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  fetchProfiles: (params: RequestMetadata) => Promise<void>
  fetchProfileById: (id: number, params: RequestMetadata) => Promise<Profile | null>
  resetProfiles: () => void
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      profiles: [],
      isLoading: false,
      error: null,

      setProfiles: (profiles: Profile[]) => set({ profiles }, false, 'profile/setProfiles'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'profile/setLoading'),

      setError: (error: string | null) => set({ error }, false, 'profile/setError'),

      clearError: () => set({ error: null }, false, 'profile/clearError'),

      fetchProfiles: async (params = DEFAULT_PARAMS): Promise<void> => {
        const { setLoading, setProfiles, setError } = get()

        try {
          setLoading(true)
          setError(null)

          const response = await profileService.readProfiles(params)
          setProfiles(response.profiles)
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching profiles:', error)
        } finally {
          setLoading(false)
        }
      },

      fetchProfileById: async (id: number, params = DEFAULT_PARAMS): Promise<Profile | null> => {
        const { setLoading, setError, profiles } = get()
        const { isForceFetch } = params

        try {
          if (!isForceFetch) {
            const existingProfile = profiles.find((p) => p.id === id)
            if (existingProfile) {
              console.log('Profile found in store, skipping API call')
              return existingProfile
            }
          }

          setLoading(true)
          setError(null)

          const response = await profileService.readProfile(id, params)

          if (response.profiles.length > 0) {
            const profile = response.profiles[0]
            const currentProfiles = get().profiles

            const updatedProfiles = currentProfiles.some((p) => p.id === profile.id)
              ? currentProfiles.map((p) => (p.id === profile.id ? profile : p))
              : [...currentProfiles, profile]

            set({ profiles: updatedProfiles }, false, 'profile/updateProfiles')
            return profile
          }

          return null
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching profile by ID:', error)
          return null
        } finally {
          setLoading(false)
        }
      },

      resetProfiles: () => set({ profiles: [], isLoading: false, error: null }, false, 'profile/resetProfiles'),
    }),
    {
      name: 'ProfileStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
