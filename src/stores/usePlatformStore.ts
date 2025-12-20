import { DEFAULT_PARAMS } from '@constants'
import { platformService } from '@services'
import type { Platform, RequestMetadata } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PlatformState {
  platforms: Platform[]
  isLoading: boolean
  error: string | null

  setPlatforms: (platforms: Platform[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  fetchPlatforms: (params: RequestMetadata) => Promise<void>
  fetchPlatformById: (id: number, params: RequestMetadata) => Promise<Platform | null>
  resetPlatforms: () => void
}

export const usePlatformStore = create<PlatformState>()(
  devtools(
    (set, get) => ({
      platforms: [],
      isLoading: false,
      error: null,

      setPlatforms: (platforms: Platform[]) => set({ platforms }, false, 'platform/setPlatforms'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'platform/setLoading'),

      setError: (error: string | null) => set({ error }, false, 'platform/setError'),

      clearError: () => set({ error: null }, false, 'platform/clearError'),

      fetchPlatforms: async (params = DEFAULT_PARAMS): Promise<void> => {
        const { setLoading, setPlatforms, setError } = get()

        try {
          setLoading(true)
          setError(null)

          const response = await platformService.readPlatforms(params)
          setPlatforms(response.platforms)
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching platforms:', error)
        } finally {
          setLoading(false)
        }
      },

      fetchPlatformById: async (id: number, params = DEFAULT_PARAMS): Promise<Platform | null> => {
        const { setLoading, setError, platforms } = get()
        const { isForceFetch } = params

        try {
          if (!isForceFetch) {
            const existingPlatform = platforms.find((p) => p.id === id)
            if (existingPlatform) {
              console.log('Platform found in store, skipping API call')
              return existingPlatform
            }
          }

          setLoading(true)
          setError(null)

          const response = await platformService.readPlatform(id, params)

          if (response.platforms.length > 0) {
            const platform = response.platforms[0]
            const currentPlatforms = get().platforms

            const updatedPlatforms = currentPlatforms.some((p) => p.id === platform.id)
              ? currentPlatforms.map((p) => (p.id === platform.id ? platform : p))
              : [...currentPlatforms, platform]

            set({ platforms: updatedPlatforms }, false, 'platform/updatePlatforms')
            return platform
          }

          return null
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching platform by ID:', error)
          return null
        } finally {
          setLoading(false)
        }
      },

      resetPlatforms: () => set({ platforms: [], isLoading: false, error: null }, false, 'platform/resetPlatforms'),
    }),
    {
      name: 'PlatformStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
