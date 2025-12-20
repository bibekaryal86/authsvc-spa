import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SpinnerState {
  isLoading: boolean
  showSpinner: () => void
  hideSpinner: () => void
  setLoading: (loading: boolean) => void
  resetSpinner: () => void
}

export const useSpinnerStore = create<SpinnerState>()(
  devtools(
    (set) => ({
      isLoading: false,

      showSpinner: () => set({ isLoading: true }, false, 'spinner/showSpinner'),

      hideSpinner: () => set({ isLoading: false }, false, 'spinner/hideSpinner'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'spinner/setLoading'),

      resetSpinner: () => set({ isLoading: false }, false, 'alert/resetSpinner'),
    }),
    {
      name: 'SpinnerStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
