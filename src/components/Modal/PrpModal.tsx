import { ACTION_TYPE, DEFAULT_PARAMS } from '@constants'
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  FormHelperText,
  type SelectChangeEvent,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  DialogActions,
} from '@mui/material'
import {
  useInvalidatePermissions,
  useInvalidatePlatforms,
  useInvalidateRoles,
  useReadPermissions,
  useReadPlatforms,
  useReadRoles,
} from '@queries'
import { prpService } from '@services'
import { useAlertStore, usePermissionStore, usePlatformStore, useRoleStore } from '@stores'
import type { Permission, Platform, Role } from '@types'
import { extractAxiosErrorMessage, getNumber, getString } from '@utils'
import React, { useState, useMemo } from 'react'

interface PrpModalProps {
  initEntity: 'platform' | 'role' | 'permission'
  selectedEntity: Platform | Role | Permission | null
}

interface SelectedIds {
  platformId: number | null
  roleId: number | null
  permissionId: number | null
}

const INITIAL_IDS: SelectedIds = { platformId: null, roleId: null, permissionId: null }

export const PrpModal: React.FC<PrpModalProps> = ({ initEntity, selectedEntity }) => {
  const { showAlert } = useAlertStore()
  const platformStore = usePlatformStore()
  const roleStore = useRoleStore()
  const permissionStore = usePermissionStore()

  const { isPrpModalOpen, selectedPrp, prpModalAction, closePrpModal } =
    initEntity === 'platform' ? platformStore : initEntity === 'role' ? roleStore : permissionStore

  const [isLoading, setIsLoading] = useState(false)
  const [userPickedIds, setUserPickedIds] = useState<SelectedIds>(INITIAL_IDS)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const { data: dataPlatforms, isLoading: isPlatformsLoading } = useReadPlatforms(DEFAULT_PARAMS)
  const { data: dataRoles, isLoading: isRolesLoading } = useReadRoles(DEFAULT_PARAMS)
  const { data: dataPermissions, isLoading: isPermissionsLoading } = useReadPermissions(DEFAULT_PARAMS)

  const platforms = useMemo(() => dataPlatforms?.platforms ?? [], [dataPlatforms?.platforms])
  const roles = useMemo(() => dataRoles?.roles ?? [], [dataRoles?.roles])
  const permissions = useMemo(() => dataPermissions?.permissions ?? [], [dataPermissions?.permissions])

  const effectiveIds = useMemo<SelectedIds>(() => {
    if (!isPrpModalOpen || !selectedEntity) return INITIAL_IDS
    if (prpModalAction === ACTION_TYPE.UNASSIGN && selectedPrp) {
      return {
        platformId: initEntity === 'platform' ? selectedEntity.id : selectedPrp.platform.id,
        roleId: initEntity === 'role' ? selectedEntity.id : selectedPrp.role.id,
        permissionId: initEntity === 'permission' ? selectedEntity.id : selectedPrp.permission.id,
      }
    }
    if (prpModalAction === ACTION_TYPE.ASSIGN) {
      return {
        platformId: initEntity === 'platform' ? selectedEntity.id : userPickedIds.platformId,
        roleId: initEntity === 'role' ? selectedEntity.id : userPickedIds.roleId,
        permissionId: initEntity === 'permission' ? selectedEntity.id : userPickedIds.permissionId,
      }
    }
    return INITIAL_IDS
  }, [initEntity, isPrpModalOpen, prpModalAction, selectedEntity, selectedPrp, userPickedIds])

  const handlePlatformChange = (event: SelectChangeEvent<string | null>) => {
    setUserPickedIds((prev) => ({ ...prev, platformId: getNumber(event.target.value) }))
  }

  const handleRoleChange = (event: SelectChangeEvent<string | null>) => {
    setUserPickedIds((prev) => ({ ...prev, roleId: getNumber(event.target.value) }))
  }

  const handlePermissionChange = (event: SelectChangeEvent<string | null>) => {
    setUserPickedIds((prev) => ({ ...prev, permissionId: getNumber(event.target.value) }))
  }

  const invalidatePlatformQuery = useInvalidatePlatforms(effectiveIds.platformId)
  const invalidateRoleQuery = useInvalidateRoles(effectiveIds.roleId)
  const invalidatePermissionQuery = useInvalidatePermissions(effectiveIds.permissionId)
  const isItLoading = isLoading || isPlatformsLoading || isRolesLoading || isPermissionsLoading

  const handleReset = () => {
    setUserPickedIds(INITIAL_IDS)
    setIsHardDelete(false)
  }

  const handleClose = () => {
    handleReset()
    closePrpModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { platformId, roleId, permissionId } = effectiveIds

    try {
      if (platformId && roleId && permissionId) {
        if (prpModalAction === ACTION_TYPE.ASSIGN) {
          await prpService.assignPrp({
            platformId,
            roleId,
            permissionId,
          })
          showAlert('success', 'Successfully submitted to assign Platform Role Permission')
        } else if (prpModalAction === ACTION_TYPE.UNASSIGN) {
          await prpService.unassignPrp(
            {
              platformId,
              roleId,
              permissionId,
            },
            isHardDelete,
          )
          showAlert('success', 'Successfully submitted to unassign Platform Role Permission')
        }
      }

      handleReset()
      closePrpModal()
      invalidatePlatformQuery()
      invalidateRoleQuery()
      invalidatePermissionQuery()
    } catch (err) {
      const errorMessage = extractAxiosErrorMessage(err)
      showAlert('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      open={isPrpModalOpen}
      onClose={handleClose}
      aria-labelledby='prp-modal-title'
      aria-describedby='prp-modal-description'
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          maxWidth: '90vw',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}
      >
        {prpModalAction === ACTION_TYPE.ASSIGN && (
          <>
            <Typography id='prp-modal-title' variant='h6' component='h2' gutterBottom>
              Assign Platform Role Permission
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth disabled={isPlatformsLoading || initEntity === 'platform'}>
                <InputLabel id='platform-select-label'>Platform</InputLabel>
                <Select
                  labelId='platform-select-label'
                  id='platform-select'
                  value={getString(effectiveIds.platformId)}
                  label='Platform'
                  onChange={handlePlatformChange}
                  renderValue={(value) => {
                    if (!value) return <em>Select a platform</em>
                    const platform = platforms.find((p) => p.id === getNumber(value))
                    return platform?.platformName || `Platform ${value}`
                  }}
                >
                  <MenuItem value=''>
                    <em>Select a platform</em>
                  </MenuItem>
                  {isPlatformsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      <Typography variant='body2' sx={{ ml: 2 }}>
                        Loading platforms...
                      </Typography>
                    </MenuItem>
                  ) : (
                    platforms.map((platform) => (
                      <MenuItem key={platform.id} value={platform.id}>
                        {platform.platformName}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {isPlatformsLoading && <FormHelperText>Loading platforms...</FormHelperText>}
              </FormControl>

              <FormControl fullWidth disabled={isRolesLoading || initEntity === 'role'}>
                <InputLabel id='role-select-label'>Role</InputLabel>
                <Select
                  labelId='role-select-label'
                  id='role-select'
                  value={getString(effectiveIds.roleId)}
                  label='Role'
                  onChange={handleRoleChange}
                  renderValue={(value) => {
                    if (!value) return <em>Select a role</em>
                    const role = roles.find((r) => r.id === getNumber(value))
                    return role?.roleName || `Role ${value}`
                  }}
                >
                  <MenuItem value=''>
                    <em>Select a role</em>
                  </MenuItem>
                  {isRolesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      <Typography variant='body2' sx={{ ml: 2 }}>
                        Loading roles...
                      </Typography>
                    </MenuItem>
                  ) : (
                    roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.roleName}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {isRolesLoading && <FormHelperText>Loading roles...</FormHelperText>}
              </FormControl>

              <FormControl fullWidth disabled={isPermissionsLoading || initEntity === 'permission'}>
                <InputLabel id='permission-select-label'>Permission</InputLabel>
                <Select
                  labelId='permission-select-label'
                  id='permission-select'
                  value={getString(effectiveIds.permissionId)}
                  label='Permission'
                  onChange={handlePermissionChange}
                  renderValue={(value) => {
                    if (!value) return <em>Select a Permission</em>
                    const permission = permissions.find((p) => p.id === getNumber(value))
                    return permission?.permissionName || `Permission ${value}`
                  }}
                >
                  <MenuItem value=''>
                    <em>Select a permission</em>
                  </MenuItem>
                  {isPermissionsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      <Typography variant='body2' sx={{ ml: 2 }}>
                        Loading permissions...
                      </Typography>
                    </MenuItem>
                  ) : (
                    permissions.map((permission) => (
                      <MenuItem key={permission.id} value={permission.id}>
                        {permission.permissionName}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {isPermissionsLoading && <FormHelperText>Loading permissions...</FormHelperText>}
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={handleClose} disabled={isItLoading}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={(e) => void handleSubmit(e)}
                  disabled={!effectiveIds.platformId || !effectiveIds.roleId || !effectiveIds.permissionId}
                >
                  {isItLoading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Processing...
                    </>
                  ) : (
                    <>Assign</>
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
        {prpModalAction === ACTION_TYPE.UNASSIGN && (
          <>
            <DialogTitle>Unassign Platform Role Permission</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {`Are you sure you want to ${isHardDelete ? 'delete' : 'unassign'} this Platform Role Permission?`}
              </DialogContentText>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isHardDelete}
                    onChange={(e) => setIsHardDelete(e.target.checked)}
                    color='error'
                    disabled={isItLoading}
                  />
                }
                label='Permanently delete (hard delete)'
                sx={{ mt: 2 }}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color='inherit' disabled={isItLoading}>
                Cancel
              </Button>
              <Button
                onClick={(e) => void handleSubmit(e)}
                color={isHardDelete ? 'error' : 'warning'}
                variant='contained'
                disabled={isItLoading}
              >
                {isItLoading ? 'Processing' : isHardDelete ? 'Delete' : 'Unassign'}
              </Button>
            </DialogActions>
          </>
        )}
      </Box>
    </Modal>
  )
}
