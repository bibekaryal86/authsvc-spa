import type { AlertColor } from '@mui/material/Alert'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AlertState {
  isOpen: boolean
  messageType: AlertColor | null
  messageText: string | null
  showAlert: (type: AlertColor, text: string) => void
  hideAlert: () => void
  resetAlertState: () => void
}

export const useAlertStore = create<AlertState>()(
  devtools(
    (set) => ({
      isOpen: false,
      messageType: null,
      messageText: null,

      showAlert: (type: AlertColor, text: string) =>
        set({ isOpen: true, messageType: type, messageText: text }, false, 'alert/showAlert'),

      hideAlert: () => set({ isOpen: false }, false, 'alert/hideAlert'),

      resetAlertState: () => set({ isOpen: false, messageType: null, messageText: null }, false, 'alert/resetAlert'),
    }),
    {
      name: 'AlertStore',
      enabled: import.meta.env.MODE !== 'production',
    },
  ),
)
