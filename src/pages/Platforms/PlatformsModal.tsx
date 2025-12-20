import { ACTION_TYPE, type ModalAction } from '@constants'
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
} from '@mui/material'
import { platformService } from '@services'
import { useAlertStore } from '@stores'
import type { Platform, PlatformRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useState, useEffect, useCallback } from 'react'

interface PlatformsModalProps {
  action: ModalAction
  open: boolean
  onClose: () => void
  onSuccess: () => void
  platform: Platform | null
  isSuperUser?: boolean
}

export const PlatformsModal: React.FC<PlatformsModalProps> = ({
  action,
  open,
  onClose,
  onSuccess,
  platform,
  isSuperUser = false,
}) => {
  const { showAlert } = useAlertStore()
  const [formData, setFormData] = useState<PlatformRequest>({
    platformName: '',
    platformDesc: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const modalConfig = {
    CREATE: {
      title: 'Add New Platform',
      success: 'Platform created successfully!',
      errorPrefix: 'Failed to create platform',
      buttonLabel: 'Create Platform',
    },
    UPDATE: {
      title: 'Update Platform',
      success: 'Platform updated successfully!',
      errorPrefix: 'Failed to update platform',
      buttonLabel: 'Update Platform',
    },
    DELETE: {
      title: `${isHardDelete ? 'Permanently' : ''} Delete Platform`,
      success: `Platform ${isHardDelete ? 'hard' : ''} deleted successfully!`,
      errorPrefix: 'Failed to delete platform',
      buttonLabel: 'Delete',
    },
    RESTORE: {
      title: 'Restore Platform',
      success: 'Platform restored successfully!',
      errorPrefix: 'Failed to restore platform',
      buttonLabel: 'Restore',
    },
  }[action]

  const resetForm = useCallback(() => {
    if (action === ACTION_TYPE.UPDATE && platform) {
      setFormData({
        platformName: platform.platformName,
        platformDesc: platform.platformDesc,
      })
    } else {
      setFormData({ platformName: '', platformDesc: '' })
    }
    setError(null)
    setHasUnsavedChanges(false)
    setShowUnsavedWarning(false)
    setIsHardDelete(platform ? platform.deletedDate !== null : false)
  }, [action, platform])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, resetForm])

  useEffect(() => {
    if (action === ACTION_TYPE.CREATE) {
      const hasChanges = formData.platformName.trim() !== '' || formData.platformDesc.trim() !== ''
      setHasUnsavedChanges(hasChanges)
    } else if (action === ACTION_TYPE.UPDATE && platform) {
      const hasChanges =
        formData.platformName.trim() !== platform.platformName || formData.platformDesc.trim() !== platform.platformDesc
      setHasUnsavedChanges(hasChanges)
    }
  }, [formData, action, platform])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    const submitAsync = async () => {
      try {
        if (action === ACTION_TYPE.CREATE) {
          await platformService.createPlatform(formData)
        } else if (action === ACTION_TYPE.UPDATE && platform?.id) {
          await platformService.updatePlatform(platform.id, formData)
        } else if (action === ACTION_TYPE.DELETE && platform?.id) {
          await platformService.deletePlatform(platform.id, isHardDelete)
        } else if (action === ACTION_TYPE.RESTORE && platform?.id) {
          await platformService.restorePlatform(platform.id)
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

  if ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !platform)
    return null

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
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

                <TextField
                  required
                  label='Platform Name'
                  name='platformName'
                  value={formData.platformName}
                  onChange={handleChange}
                  fullWidth
                  disabled={loading}
                  placeholder='e.g., Auth Service, Task Service, etc'
                  helperText='Use title case (eg: Auth Service)'
                />

                <TextField
                  required
                  label='Platform Description'
                  name='platformDesc'
                  value={formData.platformDesc}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={loading}
                  placeholder='Describe what this platform is for...'
                />
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
        {(action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE) && platform && (
          <>
            <DialogTitle>{modalConfig.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {action === ACTION_TYPE.DELETE
                  ? isHardDelete
                    ? `Are you sure you want to permanently delete "${platform.platformName}"? This action cannot be undone.`
                    : `Are you sure you want to delete "${platform.platformName}"?`
                  : action === ACTION_TYPE.RESTORE
                    ? `Are you sure you want to restore "${platform.platformName}"?`
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
