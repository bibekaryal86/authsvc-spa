import { ACCESS_TOKEN_KEY } from '@constants'
import { authService } from '@services'
import type { AuthToken, ProfilePasswordTokenResponse } from '@types'
import { checkNumber } from '@utils'
import { AxiosError } from 'axios'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { resetAllStores } from './resetAllStores.ts'

interface AuthState {
  authToken: AuthToken | null
  isAuthenticated: boolean
  isSuperUser: boolean
  isLoading: boolean

  login: (response: ProfilePasswordTokenResponse) => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
  refreshTokens: () => Promise<boolean>
}

// export const isSuperUser = (authToken: AuthToken | null): boolean => {
//   if (!getAccessToken()) return false
//   if (!authToken) return false
//   return authToken.isSuperUser
// }

export const getAccessToken = (): string => localStorage.getItem(ACCESS_TOKEN_KEY) || ''

export const setAccessToken = (token: string | ''): void => localStorage.setItem(ACCESS_TOKEN_KEY, token)

export const removeAccessToken = (): void => localStorage.removeItem(ACCESS_TOKEN_KEY)

const clearAuthCookies = () => {
  const pastDate = new Date(0).toUTCString()
  document.cookie = `refresh_token=; expires=${pastDate}; path=/;`
  document.cookie = `csrf_token=; expires=${pastDate}; path=/;`
}

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export const useAuthStore = create<AuthState>()(
  persist(
    devtools(
      (set, get) => ({
        authToken: null,
        isAuthenticated: false,
        isSuperUser: false,
        isLoading: false,

        login: (response: ProfilePasswordTokenResponse) => {
          const { authToken, accessToken } = response

          if (accessToken) {
            setAccessToken(accessToken)
          }

          set(
            {
              authToken: authToken || null,
              isAuthenticated: !!getAccessToken(),
              isSuperUser: authToken ? authToken.isSuperUser : false,
            },
            false,
            'auth/login',
          )
        },

        logout: async (): Promise<void> => {
          const { authToken } = get()

          if (authToken && authToken.profile && checkNumber(authToken.profile.id)) {
            try {
              await authService.logout(authToken.profile.id)
            } catch (error) {
              console.error('Logout API call failed:', error)
            }
          }

          set(
            {
              authToken: null,
              isAuthenticated: false,
              isSuperUser: false,
            },
            false,
            'auth/logout',
          )

          removeAccessToken()
          clearAuthCookies()
          resetAllStores()
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'auth/setLoading')
        },

        refreshTokens: async (): Promise<boolean> => {
          const { authToken, setLoading } = get()

          try {
            setLoading(true)
            const profileId = authToken?.profile?.id || 0
            const csrfToken = getCookie('csrf_token') || ''
            const response: ProfilePasswordTokenResponse = await authService.refreshToken(profileId, csrfToken)

            get().login(response)

            console.log('Tokens refreshed successfully')
            return true
          } catch (error) {
            console.error('Token refresh failed:', error)

            if (error instanceof AxiosError) {
              const status = error.response?.status || 500
              if (status >= 400 && status < 500) {
                console.log('Refresh token invalid, logging out...')
                await get().logout()
              }
            }
            return false
          } finally {
            setLoading(false)
          }
        },
      }),
      {
        name: 'AuthStore',
        enabled: import.meta.env.MODE !== 'production',
      },
    ),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        isSuperUser: state.isSuperUser,
      }),
    },
  ),
)
