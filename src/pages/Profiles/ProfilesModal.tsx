import { ACTION_TYPE, type ModalActionExtended } from '@constants'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material'
import { authService, profileService } from '@services'
import { useAlertStore } from '@stores'
import type { Profile, ProfileAddress, ProfileAddressRequest, ProfileRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useState, useEffect, useCallback } from 'react'

interface ProfilesModalProps {
  action: ModalActionExtended
  open: boolean
  onClose: () => void
  onSuccess: () => void
  profile: Profile | null
  isSuperUser?: boolean
}

interface EmailPasswordForm {
  email: string
  newPassword: string
  confirmPassword: string
}

const DefaultProfileAddressRequest: ProfileAddressRequest = {
  city: '',
  country: 'US',
  id: null,
  postalCode: '',
  profileId: 0,
  state: '',
  street: '',
}

const DefaultProfileRequest: ProfileRequest = {
  addressRequest: DefaultProfileAddressRequest,
  email: '',
  firstName: '',
  guestUser: false,
  lastName: '',
  password: '',
  phone: '',
}

const DefaultEmailPasswordForm: EmailPasswordForm = {
  email: '',
  newPassword: '',
  confirmPassword: '',
}

function checkForChanges(formData: ProfileRequest, profile?: Profile | null): boolean {
  if (profile) {
    return (
      formData.firstName !== profile.firstName ||
      formData.lastName !== profile.lastName ||
      formData.email !== profile.email ||
      formData.phone !== profile.phone ||
      hasAddressChanged(formData.addressRequest, profile.profileAddress)
    )
  }

  return (
    formData.firstName.trim() !== '' ||
    formData.lastName.trim() !== '' ||
    formData.email.trim() !== '' ||
    formData.phone !== null ||
    formData.password !== null ||
    hasAddressChanged(formData.addressRequest, null)
  )
}

function hasAddressChanged(request: ProfileAddressRequest | null, profile: ProfileAddress | null): boolean {
  if (!request && !profile) return false
  if (!request || !profile) return true

  return (
    request.street !== profile.street ||
    request.city !== profile.city ||
    request.state !== profile.state ||
    request.postalCode !== profile.postalCode ||
    request.country !== profile.country
  )
}

export const ProfilesModal: React.FC<ProfilesModalProps> = ({
  action,
  open,
  onClose,
  onSuccess,
  profile,
  isSuperUser = false,
}) => {
  const { showAlert } = useAlertStore()
  const [formData, setFormData] = useState<ProfileRequest>(DefaultProfileRequest)
  const [emailPwdFormData, setEmailPwdFormData] = useState<EmailPasswordForm>(DefaultEmailPasswordForm)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const modalConfig = {
    CREATE: {
      title: 'Add New Profile',
      success: 'Profile created successfully!',
      errorPrefix: 'Failed to create profile',
      buttonLabel: 'Create Profile',
    },
    UPDATE: {
      title: 'Update Profile',
      success: 'Profile updated successfully!',
      errorPrefix: 'Failed to update profile',
      buttonLabel: 'Update Profile',
    },
    UPDATE_EMAIL: {
      title: 'Update Profile Email',
      success: 'Profile email updated successfully!',
      errorPrefix: 'Failed to update profile email',
      buttonLabel: 'Update Email',
    },
    UPDATE_PASSWORD: {
      title: 'Update Profile Password',
      success: 'Profile password updated successfully!',
      errorPrefix: 'Failed to update profile password',
      buttonLabel: 'Update Profile',
    },
    DELETE: {
      title: `${isHardDelete ? 'Permanently' : ''} Delete Profile`,
      success: `Profile ${isHardDelete ? 'hard' : ''} deleted successfully!`,
      errorPrefix: 'Failed to delete profile',
      buttonLabel: 'Delete',
    },
    RESTORE: {
      title: 'Restore Profile',
      success: 'Profile restored successfully!',
      errorPrefix: 'Failed to restore profile',
      buttonLabel: 'Restore',
    },
    VALIDATE: {
      title: 'Validate Profile',
      success: 'Profile validation initialized successfully!',
      errorPrefix: 'Failed to validate profile',
      buttonLabel: 'Validate',
    },
    RESET: {
      title: 'Reset Profile',
      success: 'Profile reset initialized successfully!',
      errorPrefix: 'Failed to reset profile',
      buttonLabel: 'Reset',
    },
  }[action]

  const resetForm = useCallback(() => {
    if (action === ACTION_TYPE.UPDATE_EMAIL || action === ACTION_TYPE.UPDATE_PASSWORD) {
      setEmailPwdFormData(DefaultEmailPasswordForm)
    } else if (action === ACTION_TYPE.UPDATE && profile) {
      setFormData({
        email: profile.email,
        firstName: profile.firstName,
        guestUser: false,
        lastName: profile.lastName,
        password: '',
        phone: profile.phone,
        addressRequest: {
          city: profile.profileAddress?.city || '',
          country: profile.profileAddress?.country || '',
          id: profile.profileAddress?.id || 0,
          postalCode: profile.profileAddress?.postalCode || '',
          profileId: profile.id,
          state: profile.profileAddress?.state || '',
          street: profile.profileAddress?.street || '',
        },
      })
    } else {
      setFormData(DefaultProfileRequest)
    }
    setError(null)
    setHasUnsavedChanges(false)
    setShowUnsavedWarning(false)
    setIsHardDelete(profile ? profile.deletedDate !== null : false)
  }, [action, profile])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, resetForm])

  useEffect(() => {
    if (action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) {
      const hasChanges = checkForChanges(formData, profile)
      setHasUnsavedChanges(hasChanges)
    }
  }, [formData, action, profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      addressRequest: {
        ...prev.addressRequest,
        [name]: value === '' ? null : value,
        id: prev.addressRequest?.id || null,
        profileId: prev.addressRequest?.profileId || 0,
      } as ProfileAddressRequest,
    }))
  }

  const handleEmailPwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailPwdFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    const submitAsync = async () => {
      try {
        if (profile) {
          if (action === ACTION_TYPE.UPDATE) {
            await profileService.updateProfile(profile.id, formData)
          } else if (action === ACTION_TYPE.UPDATE_EMAIL) {
            await profileService.updateProfileEmail(profile.id, {
              oldEmail: profile.email,
              newEmail: emailPwdFormData.email,
            })
          } else if (action === ACTION_TYPE.UPDATE_PASSWORD) {
            if (emailPwdFormData.newPassword !== emailPwdFormData.confirmPassword) {
              showAlert('error', 'Passwords do not match.')
              return
            }

            if (emailPwdFormData.newPassword.length < 8) {
              showAlert('error', 'Password must be at least 8 characters long.')
              return
            }
            await profileService.updateProfilePassword(profile.id, {
              email: profile.email,
              password: emailPwdFormData.newPassword,
            })
          } else if (action === ACTION_TYPE.DELETE) {
            await profileService.deleteProfile(profile.id, isHardDelete)
          } else if (action === ACTION_TYPE.RESTORE) {
            await profileService.restoreProfile(profile.id)
          } else if (action === ACTION_TYPE.VALIDATE) {
            await authService.validateProfileInit(profile.email)
          } else if (action === ACTION_TYPE.RESET) {
            await authService.resetProfileInit(profile.email)
          }
        } else if (action === ACTION_TYPE.CREATE) {
          await authService.createProfile(formData)
        }

        showAlert('success', modalConfig.success)
        onSuccess()
        resetForm()
        onClose()
      } catch (err) {
        const errorMessage = extractAxiosErrorMessage(err)
        setError(errorMessage)
        showAlert('error', `${modalConfig.errorPrefix}: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    void submitAsync()
  }

  const handleClose = () => {
    if ((action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && hasUnsavedChanges) {
      setShowUnsavedWarning(true)
    } else {
      resetForm()
      onClose()
    }
  }

  const handleConfirmClose = () => {
    resetForm()
    setShowUnsavedWarning(false)
    onClose()
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  if (
    (action === ACTION_TYPE.DELETE ||
      action === ACTION_TYPE.RESTORE ||
      action === ACTION_TYPE.UPDATE ||
      action === ACTION_TYPE.UPDATE_EMAIL ||
      action === ACTION_TYPE.UPDATE_PASSWORD) &&
    !profile
  )
    return null

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
        {' '}
        {(action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && (
                  <Alert severity='error' sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='First Name'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleChange}
                      fullWidth
                      disabled={loading}
                      placeholder='John'
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Last Name'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleChange}
                      fullWidth
                      disabled={loading}
                      placeholder='Doe'
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      disabled={loading || action === ACTION_TYPE.UPDATE}
                      placeholder='john.doe@example.com'
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label='Phone'
                      name='phone'
                      value={formData.phone || ''}
                      onChange={handleChange}
                      fullWidth
                      disabled={loading}
                      placeholder='+1 (555) 123-4567'
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Password'
                      name='password'
                      type='password'
                      value={formData.password || ''}
                      onChange={handleChange}
                      fullWidth
                      disabled={action !== ACTION_TYPE.CREATE}
                      placeholder='Enter password'
                    />
                  </Grid>

                  {isSuperUser && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.guestUser}
                            onChange={(e) => setFormData((prev) => ({ ...prev, guestUser: e.target.checked }))}
                            disabled={loading}
                          />
                        }
                        label='Guest User'
                      />
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant='h6' gutterBottom fontWeight='medium'>
                    Address Information
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label='Street Address'
                        name='street'
                        value={formData.addressRequest?.street || ''}
                        onChange={handleAddressChange}
                        fullWidth
                        disabled={loading}
                        placeholder='123 Main St'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label='City'
                        name='city'
                        value={formData.addressRequest?.city || ''}
                        onChange={handleAddressChange}
                        fullWidth
                        disabled={loading}
                        placeholder='New York'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label='State'
                        name='state'
                        value={formData.addressRequest?.state || ''}
                        onChange={handleAddressChange}
                        fullWidth
                        disabled={loading}
                        placeholder='NY'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label='Postal Code'
                        name='postalCode'
                        value={formData.addressRequest?.postalCode || ''}
                        onChange={handleAddressChange}
                        fullWidth
                        disabled={loading}
                        placeholder='10001'
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label='Country'
                        name='country'
                        value={formData.addressRequest?.country || ''}
                        onChange={handleAddressChange}
                        fullWidth
                        disabled={loading}
                        placeholder='United States'
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                {loading ? 'Processing...' : modalConfig.buttonLabel}
              </Button>
            </DialogActions>
          </form>
        )}
        {action === ACTION_TYPE.UPDATE_EMAIL && (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && (
                  <Alert severity='error' sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Current Email'
                      name='currentEmailPlaceholder'
                      value={profile?.email}
                      fullWidth
                      disabled={true}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Enter New Email'
                      name='email'
                      value={emailPwdFormData.email}
                      onChange={handleEmailPwdChange}
                      fullWidth
                      disabled={loading}
                      placeholder='new@email.com'
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                {loading ? 'Processing...' : modalConfig.buttonLabel}
              </Button>
            </DialogActions>
          </form>
        )}
        {action === ACTION_TYPE.UPDATE_PASSWORD && (
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {error && (
                  <Alert severity='error' sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField required label='Email' name='email' value={profile?.email} fullWidth disabled={true} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Enter Password'
                      name='newPassword'
                      type='password'
                      value={emailPwdFormData.newPassword}
                      onChange={handleEmailPwdChange}
                      fullWidth
                      disabled={loading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      required
                      label='Confirm Password'
                      name='confirmPassword'
                      type='password'
                      value={emailPwdFormData.confirmPassword}
                      onChange={handleEmailPwdChange}
                      fullWidth
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : undefined}
              >
                {loading ? 'Processing...' : modalConfig.buttonLabel}
              </Button>
            </DialogActions>
          </form>
        )}
        {(action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE) && profile && (
          <>
            <DialogTitle>{modalConfig.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {action === ACTION_TYPE.DELETE
                  ? isHardDelete
                    ? `Are you sure you want to permanently delete profile "${profile.firstName} ${profile.lastName}"? This action cannot be undone.`
                    : `Are you sure you want to delete profile "${profile.firstName} ${profile.lastName}"?`
                  : action === ACTION_TYPE.RESTORE
                    ? `Are you sure you want to restore profile "${profile.firstName} ${profile.lastName}"?`
                    : ''}
              </DialogContentText>

              {action === ACTION_TYPE.DELETE && isSuperUser && (
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
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color='inherit' disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit()}
                color={action === ACTION_TYPE.DELETE ? (isHardDelete ? 'error' : 'warning') : 'warning'}
                variant='contained'
                disabled={loading}
              >
                {loading ? 'Processing' : modalConfig.buttonLabel}
              </Button>
            </DialogActions>
          </>
        )}
        {(action === ACTION_TYPE.VALIDATE || action === ACTION_TYPE.RESET) && profile && (
          <>
            <DialogTitle>{modalConfig.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {action === ACTION_TYPE.VALIDATE
                  ? `Are you sure you want to start validation for profile "${profile.firstName} ${profile.lastName}"?`
                  : action === ACTION_TYPE.RESET
                    ? `Are you sure you want to start reset for profile "${profile.firstName} ${profile.lastName}"?`
                    : ''}
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color='inherit' disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmit()}
                color={action === ACTION_TYPE.VALIDATE ? 'warning' : 'error'}
                variant='contained'
                disabled={loading}
              >
                {loading ? 'Processing' : modalConfig.buttonLabel}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {(action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && (
        <Dialog open={showUnsavedWarning} onClose={handleCancelClose} maxWidth='xs' fullWidth>
          <DialogTitle>
            <Typography variant='h6' fontWeight='bold'>
              Unsaved Changes
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography>You have unsaved changes. Are you sure you want to close? All changes will be lost.</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCancelClose}>Cancel</Button>
            <Button onClick={handleConfirmClose} variant='contained' color='error'>
              Discard Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
