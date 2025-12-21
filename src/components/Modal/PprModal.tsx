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
  useInvalidateProfiles,
  useInvalidatePlatforms,
  useInvalidateRoles,
  useReadPlatforms,
  useReadProfiles,
  useReadRoles,
} from '@queries'
import { pprService } from '@services'
import { useAlertStore, usePlatformStore, useProfileStore, useRoleStore } from '@stores'
import type { Platform, Profile, Role } from '@types'
import { extractAxiosErrorMessage, getNumber, getString, getUserFullName } from '@utils'
import React, { useState, useEffect, useMemo } from 'react'

interface PprModalProps {
  initEntity: 'platform' | 'profile' | 'role'
  selectedEntity: Platform | Profile | Role | null
}

export const PprModal: React.FC<PprModalProps> = ({ initEntity, selectedEntity }) => {
  const { showAlert } = useAlertStore()

  const platformStore = usePlatformStore()
  const profileStore = useProfileStore()
  const roleStore = useRoleStore()

  const { isPprModalOpen, selectedPpr, pprModalAction, closePprModal } =
    initEntity === 'platform' ? platformStore : initEntity === 'profile' ? profileStore : roleStore

  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlatformId, setSelectedPlatformId] = useState<number | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const { data: dataPlatforms, isLoading: isPlatformsLoading } = useReadPlatforms(DEFAULT_PARAMS)
  const { data: dataProfiles, isLoading: isProfilesLoading } = useReadProfiles(DEFAULT_PARAMS)
  const { data: dataRoles, isLoading: isRolesLoading } = useReadRoles(DEFAULT_PARAMS)

  const platforms = useMemo(() => dataPlatforms?.platforms ?? [], [dataPlatforms?.platforms])
  const profiles = useMemo(() => dataProfiles?.profiles ?? [], [dataProfiles?.profiles])
  const roles = useMemo(() => dataRoles?.roles ?? [], [dataRoles?.roles])

  useEffect(() => {
    if (isPprModalOpen && selectedEntity) {
      if (pprModalAction === ACTION_TYPE.UNASSIGN && selectedPpr) {
        setSelectedPlatformId(initEntity === 'platform' ? selectedEntity.id : selectedPpr.platform.id)
        setSelectedProfileId(initEntity === 'profile' ? selectedEntity.id : selectedPpr.profile.id)
        setSelectedRoleId(initEntity === 'role' ? selectedEntity.id : selectedPpr.role.id)
      } else if (pprModalAction === ACTION_TYPE.ASSIGN) {
        if (initEntity === 'platform') {
          setSelectedPlatformId(selectedEntity.id)
        } else if (initEntity === 'profile') {
          setSelectedProfileId(selectedEntity.id)
        } else if (initEntity === 'role') {
          setSelectedRoleId(selectedEntity.id)
        }
      }
    }
  }, [
    initEntity,
    isPprModalOpen,
    platforms.length,
    pprModalAction,
    profiles.length,
    roles.length,
    selectedEntity,
    selectedPpr,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (selectedPlatformId && selectedProfileId && selectedRoleId) {
        if (pprModalAction === ACTION_TYPE.ASSIGN) {
          await pprService.assignPpr({
            platformId: selectedPlatformId,
            profileId: selectedProfileId,
            roleId: selectedRoleId,
          })
          showAlert('success', 'Successfully assigned Platform Profile Role')
        } else if (pprModalAction === ACTION_TYPE.UNASSIGN) {
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

      handleReset()
      closePprModal()
      invalidatePlatformQuery()
      invalidateProfileQuery()
      invalidateRoleQuery()
    } catch (err) {
      const errorMessage = extractAxiosErrorMessage(err)
      showAlert('error', errorMessage)
    } finally {
      setIsLoading(false)
    }
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
    closePprModal()
  }

  const invalidatePlatformQuery = useInvalidatePlatforms(selectedPlatformId)
  const invalidateProfileQuery = useInvalidateProfiles(selectedProfileId)
  const invalidateRoleQuery = useInvalidateRoles(selectedRoleId)
  const isItLoading = isLoading || isPlatformsLoading || isProfilesLoading || isRolesLoading

  return (
    <Modal
      open={isPprModalOpen}
      onClose={handleClose}
      aria-labelledby='ppr-modal-title'
      aria-describedby='ppr-modal-description'
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
        {pprModalAction === ACTION_TYPE.ASSIGN && (
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
                <Button onClick={handleClose} disabled={isItLoading}>
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  onClick={(e) => void handleSubmit(e)}
                  disabled={!selectedPlatformId || !selectedProfileId || !selectedRoleId}
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
        {pprModalAction === ACTION_TYPE.UNASSIGN && (
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
