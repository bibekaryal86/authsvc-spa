import { useAlertStore } from './useAlertStore'
import { usePermissionStore } from './usePermissionStore'
import { usePlatformStore } from './usePlatformStore.ts'
import { useProfileStore } from './useProfileStore.ts'
import { useRoleStore } from './useRoleStore.ts'
import { useSpinnerStore } from './useSpinnerStore'

export const resetAllStores = () => {
  useAlertStore.getState().resetAlertState()
  usePermissionStore.getState().resetPermissionState()
  usePlatformStore.getState().resetPlatformState()
  useProfileStore.getState().resetProfileState()
  useRoleStore.getState().resetRoleState()
  useSpinnerStore.getState().resetSpinnerState()
}
