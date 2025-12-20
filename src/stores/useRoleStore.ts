import { DEFAULT_PARAMS } from '@constants'
import { roleService } from '@services'
import type { Role, RequestMetadata } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RoleState {
  roles: Role[]
  isLoading: boolean
  error: string | null

  setRoles: (roles: Role[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  fetchRoles: (params: RequestMetadata) => Promise<void>
  fetchRoleById: (id: number, params: RequestMetadata) => Promise<Role | null>
  resetRoles: () => void
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set, get) => ({
      roles: [],
      isLoading: false,
      error: null,

      setRoles: (roles: Role[]) => set({ roles }, false, 'role/setRoles'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'role/setLoading'),

      setError: (error: string | null) => set({ error }, false, 'role/setError'),

      clearError: () => set({ error: null }, false, 'role/clearError'),

      fetchRoles: async (params = DEFAULT_PARAMS): Promise<void> => {
        const { setLoading, setRoles, setError } = get()

        try {
          setLoading(true)
          setError(null)

          const response = await roleService.readRoles(params)
          setRoles(response.roles)
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching roles:', error)
        } finally {
          setLoading(false)
        }
      },

      fetchRoleById: async (id: number, params = DEFAULT_PARAMS): Promise<Role | null> => {
        const { setLoading, setError, roles } = get()
        const { isForceFetch } = params

        try {
          if (!isForceFetch) {
            const existingRole = roles.find((p) => p.id === id)
            if (existingRole) {
              console.log('Role found in store, skipping API call')
              return existingRole
            }
          }

          setLoading(true)
          setError(null)

          const response = await roleService.readRole(id, params)

          if (response.roles.length > 0) {
            const role = response.roles[0]
            const currentRoles = get().roles

            const updatedRoles = currentRoles.some((p) => p.id === role.id)
              ? currentRoles.map((p) => (p.id === role.id ? role : p))
              : [...currentRoles, role]

            set({ roles: updatedRoles }, false, 'role/updateRoles')
            return role
          }

          return null
        } catch (error) {
          const errorMessage = extractAxiosErrorMessage(error)
          setError(errorMessage)
          console.error('Error fetching role by ID:', error)
          return null
        } finally {
          setLoading(false)
        }
      },

      resetRoles: () => set({ roles: [], isLoading: false, error: null }, false, 'role/resetRoles'),
    }),
    {
      name: 'RoleStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
