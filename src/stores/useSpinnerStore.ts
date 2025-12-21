import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface SpinnerState {
  isLoading: boolean
  showSpinner: () => void
  hideSpinner: () => void
  setLoading: (loading: boolean) => void
  resetSpinnerState: () => void
}

export const useSpinnerStore = create<SpinnerState>()(
  devtools(
    (set) => ({
      isLoading: false,

      showSpinner: () => set({ isLoading: true }, false, 'spinner/showSpinner'),

      hideSpinner: () => set({ isLoading: false }, false, 'spinner/hideSpinner'),

      setLoading: (loading: boolean) => set({ isLoading: loading }, false, 'spinner/setLoading'),

      resetSpinnerState: () => set({ isLoading: false }, false, 'spinner/resetSpinner'),
    }),
    {
      name: 'SpinnerStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
