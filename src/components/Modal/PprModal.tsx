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
import { pprService } from '@services'
import { useAlertStore, usePlatformStore, useProfileStore, useRoleStore } from '@stores'
import type { Platform, PlatformProfileRole, Profile, Role } from '@types'
import { extractAxiosErrorMessage, getNumber, getString, getUserFullName } from '@utils'
import React, { useState, useEffect } from 'react'

interface PprModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  action: PrpPprAction | null
  initEntity: 'platform' | 'profile' | 'role'
  selectedEntity: Platform | Profile | Role
  selectedPpr: PlatformProfileRole | null
}

export const PprModal: React.FC<PprModalProps> = ({
  open,
  onClose,
  onSuccess,
  action,
  initEntity,
  selectedEntity,
  selectedPpr,
}) => {
  const [loading, setLoading] = useState(false)

  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const { showAlert } = useAlertStore()
  const { platforms, fetchPlatforms, isLoading: isPlatformsLoading } = usePlatformStore()
  const { profiles, fetchProfiles, isLoading: isProfilesLoading } = useProfileStore()
  const { roles, fetchRoles, isLoading: isRolesLoading } = useRoleStore()

  useEffect(() => {
    if (open) {
      if (action === ACTION_TYPE.UNASSIGN && selectedPpr) {
        setSelectedPlatformId(initEntity === 'platform' ? selectedEntity.id : selectedPpr.platform.id)
        setSelectedProfileId(initEntity === 'profile' ? selectedEntity.id : selectedPpr.profile.id)
        setSelectedRoleId(initEntity === 'role' ? selectedEntity.id : selectedPpr.role.id)
      } else if (action === ACTION_TYPE.ASSIGN) {
        if (initEntity === 'platform') {
          setSelectedPlatformId(selectedEntity.id)
          if (profiles.length === 0) {
            void fetchProfiles(DEFAULT_PARAMS)
          }
          if (roles.length === 0) {
            void fetchRoles(DEFAULT_PARAMS)
          }
        } else if (initEntity === 'profile') {
          setSelectedProfileId(selectedEntity.id)
          if (platforms.length === 0) {
            void fetchPlatforms(DEFAULT_PARAMS)
          }
          if (roles.length === 0) {
            void fetchRoles(DEFAULT_PARAMS)
          }
        } else if (initEntity === 'role') {
          setSelectedRoleId(selectedEntity.id)
          if (platforms.length === 0) {
            void fetchPlatforms(DEFAULT_PARAMS)
          }
          if (profiles.length === 0) {
            void fetchProfiles(DEFAULT_PARAMS)
          }
        }
      }
    }
  }, [
    fetchPlatforms,
    fetchProfiles,
    fetchRoles,
    initEntity,
    open,
    platforms.length,
    profiles.length,
    roles.length,
    selectedEntity.id,
  ])

  const handlePlatformChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedPlatformId(getNumber(value))
  }

  const handleProfileChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedProfileId(getNumber(value))
  }

  const handleRoleChange = (event: SelectChangeEvent<string | null>) => {
    const value = event.target.value
    setSelectedRoleId(getNumber(value))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    const submitAsync = async () => {
      try {
        if (selectedPlatformId && selectedProfileId && selectedRoleId) {
          if (action === ACTION_TYPE.ASSIGN) {
            await pprService.assignPpr({
              platformId: selectedPlatformId,
              profileId: selectedProfileId,
              roleId: selectedRoleId,
            })
            showAlert('success', 'Successfully assigned Platform Profile Role')
          } else if (action === ACTION_TYPE.UNASSIGN) {
            await pprService.unassignPpr(
              {
                platformId: selectedPlatformId,
                profileId: selectedProfileId,
                roleId: selectedRoleId,
              },
              isHardDelete,
            )
            showAlert('success', `Successfully ${isHardDelete ? 'deleted' : 'unassigned'} Platform Role Permission`)
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
      setSelectedProfileId(null)
      setSelectedRoleId(null)
    } else if (initEntity === 'profile') {
      setSelectedPlatformId(null)
      setSelectedRoleId(null)
    } else if (initEntity === 'role') {
      setSelectedPlatformId(null)
      setSelectedProfileId(null)
    }
    setIsHardDelete(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='ppr-modal-title' aria-describedby='ppr-modal-description'>
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
            <Typography id='add-assignment-modal-title' variant='h6' component='h2' gutterBottom>
              Assign Platform Profile Role
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

              <FormControl fullWidth disabled={isProfilesLoading || initEntity === 'profile'}>
                <InputLabel id='profile-select-label'>Profile</InputLabel>
                <Select
                  labelId='profile-select-label'
                  id='profile-select'
                  value={getString(selectedProfileId)}
                  label='Profile'
                  onChange={handleProfileChange}
                  renderValue={(value) => {
                    if (!value) return <em>Select a Profile</em>
                    const profile = profiles.find((p) => p.id === getNumber(value))
                    return profile ? getUserFullName(profile) : `Profile ${value}`
                  }}
                >
                  <MenuItem value=''>
                    <em>Select a profile</em>
                  </MenuItem>
                  {isProfilesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                      <Typography variant='body2' sx={{ ml: 2 }}>
                        Loading profiles...
                      </Typography>
                    </MenuItem>
                  ) : (
                    profiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id}>
                        {getUserFullName(profile)}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {isProfilesLoading && <FormHelperText>Loading profiles...</FormHelperText>}
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSubmit}
                  disabled={!selectedPlatformId || !selectedProfileId || !selectedRoleId}
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
            <DialogTitle>Unassign Platform Profile Role</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {`Are you sure you want to ${isHardDelete ? 'delete' : 'unassign'} this Platform Profile Role?`}
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
