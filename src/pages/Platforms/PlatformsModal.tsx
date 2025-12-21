import { ACTION_TYPE } from '@constants'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  DialogContentText,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useCreatePlatform, useUpdatePlatform, useDeletePlatform, useRestorePlatform } from '@queries'
import { useAlertStore, useAuthStore, usePlatformStore } from '@stores'
import type { PlatformRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useState, useCallback, useMemo } from 'react'

export const PlatformsModal: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const { showAlert } = useAlertStore()

  const {
    isPlatformModalOpen,
    platformModalAction: action,
    selectedPlatform: platform,
    closePlatformModal,
  } = usePlatformStore()

  const createPlatform = useCreatePlatform()
  const updatePlatform = useUpdatePlatform()
  const deletePlatform = useDeletePlatform()
  const restorePlatform = useRestorePlatform()

  const [formData, setFormData] = useState<PlatformRequest>({
    platformName: platform ? platform.platformName : '',
    platformDesc: platform ? platform.platformDesc : '',
  })

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const resetForm = useCallback(() => {
    if (platform) {
      setFormData({
        platformName: platform.platformName,
        platformDesc: platform.platformDesc,
      })
      setIsHardDelete(platform.deletedDate !== null)
    } else {
      setFormData({ platformName: '', platformDesc: '' })
      setIsHardDelete(false)
    }
  }, [platform])

  const hasUnsavedChanges = useMemo(() => {
    if (action === ACTION_TYPE.CREATE) {
      return formData.platformName.trim() !== '' || formData.platformDesc.trim() !== ''
    }

    if (action === ACTION_TYPE.UPDATE && platform) {
      return (
        formData.platformName.trim() !== platform.platformName || formData.platformDesc.trim() !== platform.platformDesc
      )
    }

    return false
  }, [formData, action, platform])

  if (
    !action ||
    ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !platform)
  )
    return null

  const isLoading =
    createPlatform.isPending || updatePlatform.isPending || deletePlatform.isPending || restorePlatform.isPending

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (action === ACTION_TYPE.CREATE) {
        await createPlatform.mutateAsync(formData)
      } else if (action === ACTION_TYPE.UPDATE && platform?.id) {
        await updatePlatform.mutateAsync({
          id: platform.id,
          payload: formData,
        })
      } else if (action === ACTION_TYPE.DELETE && platform?.id) {
        await deletePlatform.mutateAsync({
          id: platform.id,
          isHardDelete,
        })
      } else if (action === ACTION_TYPE.RESTORE && platform?.id) {
        await restorePlatform.mutateAsync(platform.id)
      }

      showAlert('success', modalConfig.success)
      resetForm()
      closePlatformModal()
    } catch (err) {
      const errorMessage = extractAxiosErrorMessage(err)
      showAlert('error', `${modalConfig.errorPrefix}: ${errorMessage}`)
    }
  }

  const handleClose = () => {
    if ((action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && hasUnsavedChanges) {
      setShowUnsavedWarning(true)
    } else {
      resetForm()
      closePlatformModal()
    }
  }

  const handleConfirmClose = () => {
    resetForm()
    setShowUnsavedWarning(false)
    closePlatformModal()
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  if ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !platform)
    return null

  return (
    <>
      <Dialog open={isPlatformModalOpen} onClose={handleClose} maxWidth='sm' fullWidth>
        {(action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  required
                  label='Platform Name'
                  name='platformName'
                  value={formData.platformName}
                  onChange={handleChange}
                  fullWidth
                  disabled={isLoading}
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
                  disabled={isLoading}
                  placeholder='Describe what this platform is for...'
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
              >
                {isLoading ? 'Processing...' : modalConfig.buttonLabel}
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
                      disabled={isLoading}
                    />
                  }
                  label='Permanently delete (hard delete)'
                  sx={{ mt: 2 }}
                />
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color='inherit' disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={(e) => void handleSubmit(e)}
                color={action === ACTION_TYPE.DELETE ? (isHardDelete ? 'error' : 'warning') : 'warning'}
                variant='contained'
                disabled={isLoading}
              >
                {isLoading ? 'Processing' : modalConfig.buttonLabel}
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
