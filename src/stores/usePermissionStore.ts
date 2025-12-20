import { DEFAULT_PARAMS } from '@constants'
import { permissionService } from '@services'
import type { Permission, RequestMetadata } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PermissionState {
  permissions: Permission[]
  platformNames: string[]
  isLoading: boolean
  error: string | null

  setPermissions: (permissions: Permission[]) => void
  setPlatformNames: (platformNames: string[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  fetchPermissions: (params: RequestMetadata) => Promise<void>
  fetchPermissionById: (id: number, params: RequestMetadata) => Promise<Permission | null>
  resetPermissions: () => void
}

export const usePermissionStore = create<PermissionState>()(
  devtools(
    (set, get) => ({
      permissions: [],
      platformNames: [],
      isLoading: false,
      error: null,

      setPermissions: (permissions: Permission[]) => set({ permissions }, false, 'permission/setPermissions'),

      setPlatformNames: (platformNames: string[]) => set({ platformNames }, false, 'permission/setPlatformNames'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'permission/setLoading'),

      setError: (error: string | null) => set({ error }, false, 'permission/setError'),

      clearError: () => set({ error: null }, false, 'permission/clearError'),

      fetchPermissions: async (params = DEFAULT_PARAMS): Promise<void> => {
        const { setLoading, setPermissions, setPlatformNames, setError } = get()

        try {
          setLoading(true)
          setError(null)

          const response = await permissionService.readPermissions(params)
          setPermissions(response.permissions)
          setPlatformNames(response.platformNames)
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching permissions:', error)
        } finally {
          setLoading(false)
        }
      },

      fetchPermissionById: async (id: number, params = DEFAULT_PARAMS): Promise<Permission | null> => {
        const { setLoading, setError, permissions } = get()
        const { isForceFetch } = params

        try {
          if (!isForceFetch) {
            const existingPermission = permissions.find((p) => p.id === id)
            if (existingPermission) {
              console.log('Permission found in store, skipping API call')
              return existingPermission
            }
          }

          setLoading(true)
          setError(null)

          const response = await permissionService.readPermission(id, params)

          if (response.permissions.length > 0) {
            const permission = response.permissions[0]
            const currentPermissions = get().permissions

            const updatedPermissions = currentPermissions.some((p) => p.id === permission.id)
              ? currentPermissions.map((p) => (p.id === permission.id ? permission : p))
              : [...currentPermissions, permission]

            set({ permissions: updatedPermissions }, false, 'permission/updatePermissions')
            return permission
          }

          return null
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching permission by ID:', error)
          return null
        } finally {
          setLoading(false)
        }
      },

      resetPermissions: () =>
        set({ permissions: [], isLoading: false, error: null }, false, 'permission/resetPermissions'),
    }),
    {
      name: 'PermissionStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
