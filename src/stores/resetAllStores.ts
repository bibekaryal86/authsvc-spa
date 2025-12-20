import { useAlertStore } from './useAlertStore'
import { usePermissionStore } from './usePermissionStore'
import { useSpinnerStore } from './useSpinnerStore'

export const resetAllStores = () => {
  useAlertStore.getState().resetAlert()
  usePermissionStore.getState().resetPermissions()
  useSpinnerStore.getState().resetSpinner()
}
