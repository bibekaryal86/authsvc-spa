import { type ThemeMode, THEME_MODES, STORAGE_KEYS } from '@constants'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface ThemeState {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        mode: THEME_MODES.LIGHT,

        toggleTheme: () =>
          set(
            (state) => ({
              mode: state.mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT,
            }),
            false,
            'theme/toggleTheme',
          ),

        setTheme: (mode: ThemeMode) => set({ mode }, false, 'theme/setTheme'),
      }),
      {
        name: STORAGE_KEYS.THEME,
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name)
            return str ? JSON.parse(str) : null
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name) => sessionStorage.removeItem(name),
        },
      },
    ),
    {
      name: 'ThemeStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
