import { ACTION_TYPE, DEFAULT_PARAMS, type PrpPprAction } from '@constants'
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
import { prpService } from '@services'
import { useAlertStore, usePermissionStore, usePlatformStore, useRoleStore } from '@stores'
import type { Permission, Platform, PlatformRolePermission, Role } from '@types'
import { extractAxiosErrorMessage, getNumber, getString } from '@utils'
import React, { useState, useEffect } from 'react'

interface PrpModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  action: PrpPprAction | null
  initEntity: 'platform' | 'role' | 'permission'
  selectedEntity: Platform | Role | Permission
  selectedPrp: PlatformRolePermission | null
}

export const PrpModal: React.FC<PrpModalProps> = ({
  open,
  onClose,
  onSuccess,
  action,
  initEntity,
  selectedEntity,
  selectedPrp,
}) => {
  const [loading, setLoading] = useState(false)

  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const { showAlert } = useAlertStore()
  const { platforms, fetchPlatforms, isLoading: isPlatformsLoading } = usePlatformStore()
  const { roles, fetchRoles, isLoading: isRolesLoading } = useRoleStore()
  const { permissions, fetchPermissions, isLoading: isPermissionsLoading } = usePermissionStore()

  useEffect(() => {
    if (open) {
      if (action === ACTION_TYPE.UNASSIGN && selectedPrp) {
        setSelectedPlatformId(initEntity === 'platform' ? selectedEntity.id : selectedPrp.platform.id)
        setSelectedRoleId(initEntity === 'role' ? selectedEntity.id : selectedPrp.role.id)
        setSelectedPermissionId(initEntity === 'permission' ? selectedEntity.id : selectedPrp.permission.id)
      } else if (action === ACTION_TYPE.ASSIGN) {
        if (initEntity === 'platform') {
          setSelectedPlatformId(selectedEntity.id)
          if (roles.length === 0) {
            void fetchRoles(DEFAULT_PARAMS)
          }
          if (permissions.length === 0) {
            void fetchPermissions(DEFAULT_PARAMS)
          }
        } else if (initEntity === 'role') {
          setSelectedRoleId(selectedEntity.id)
          if (platforms.length === 0) {
            void fetchPlatforms(DEFAULT_PARAMS)
          }
          if (permissions.length === 0) {
            void fetchPermissions(DEFAULT_PARAMS)
          }
        } else if (initEntity === 'permission') {
          setSelectedPermissionId(selectedEntity.id)
          if (platforms.length === 0) {
            void fetchPlatforms(DEFAULT_PARAMS)
          }
          if (roles.length === 0) {
            void fetchRoles(DEFAULT_PARAMS)
          }
        }
      }
    }
  }, [
    action,
    fetchPermissions,
    fetchPlatforms,
    fetchRoles,
    initEntity,
    open,
    permissions.length,
    platforms.length,
    roles.length,
    selectedEntity.id,
  ])

  const handlePlatformChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedPlatformId(getNumber(value))
  }

  const handleRoleChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedRoleId(getNumber(value))
  }

  const handlePermissionChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedPermissionId(getNumber(value))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    console.log(
      `Action: ${action} PlatformId: ${selectedPlatformId} RoleId: ${selectedRoleId} PermissionId: ${selectedPermissionId}`,
    )
    if (e) e.preventDefault()
    setLoading(true)

    const submitAsync = async () => {
      try {
        if (selectedPlatformId && selectedRoleId && selectedPermissionId) {
          if (action === ACTION_TYPE.ASSIGN) {
            await prpService.assignPrp({
              platformId: selectedPlatformId,
              roleId: selectedRoleId,
              permissionId: selectedPermissionId,
            })
            showAlert('success', 'Successfully submitted to assign Platform Role Permission')
          } else if (action === ACTION_TYPE.UNASSIGN) {
            await prpService.unassignPrp(
              {
                platformId: selectedPlatformId,
                roleId: selectedRoleId,
                permissionId: selectedPermissionId,
              },
              isHardDelete,
            )
            showAlert('success', 'Successfully submitted to unassign Platform Role Permission')
          }
        }

        onSuccess()
        handleReset()
        onClose()
      } catch (err) {
        const errorMessage = extractAxiosErrorMessage(err)
        showAlert('error', errorMessage)
      } finally {
        setLoading(false)
      }
    }

    void submitAsync()
  }

  const handleReset = () => {
    if (initEntity === 'platform') {
      setSelectedRoleId(null)
      setSelectedPermissionId(null)
    } else if (initEntity === 'role') {
      setSelectedPlatformId(null)
      setSelectedPermissionId(null)
    } else if (initEntity === 'permission') {
      setSelectedPlatformId(null)
      setSelectedRoleId(null)
    }
    setIsHardDelete(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='prp-modal-title' aria-describedby='prp-modal-description'>
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
        {action === ACTION_TYPE.ASSIGN && (
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
                  value={getString(selectedPlatformId)}
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
                  value={getString(selectedRoleId)}
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
                  value={getString(selectedPermissionId)}
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
                <Button onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSubmit}
                  disabled={!selectedPlatformId || !selectedRoleId || !selectedPermissionId}
                >
                  {loading ? (
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
        {action === ACTION_TYPE.UNASSIGN && (
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
                    disabled={loading}
                  />
                }
                label='Permanently delete (hard delete)'
                sx={{ mt: 2 }}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color='inherit' disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit()}
                color={isHardDelete ? 'error' : 'warning'}
                variant='contained'
                disabled={loading}
              >
                {loading ? 'Processing' : isHardDelete ? 'Delete' : 'Unassign'}
              </Button>
            </DialogActions>
          </>
        )}
      </Box>
    </Modal>
  )
}
