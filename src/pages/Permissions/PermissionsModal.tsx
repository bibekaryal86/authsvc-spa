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
import { useCreatePermission, useUpdatePermission, useDeletePermission, useRestorePermission } from '@queries'
import { useAlertStore, useAuthStore, usePermissionStore } from '@stores'
import type { PermissionRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useState, useCallback, useMemo } from 'react'

export const PermissionsModal: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const { showAlert } = useAlertStore()

  const {
    isPermissionModalOpen,
    permissionModalAction: action,
    selectedPermission: permission,
    closePermissionModal,
  } = usePermissionStore()

  const createPermission = useCreatePermission()
  const updatePermission = useUpdatePermission()
  const deletePermission = useDeletePermission()
  const restorePermission = useRestorePermission()

  const [formData, setFormData] = useState<PermissionRequest>({
    permissionName: permission ? permission.permissionName : '',
    permissionDesc: permission ? permission.permissionDesc : '',
  })
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const resetForm = useCallback(() => {
    if (permission) {
      setFormData({
        permissionName: permission.permissionName,
        permissionDesc: permission.permissionDesc,
      })
      setIsHardDelete(permission.deletedDate !== null)
    } else {
      setFormData({ permissionName: '', permissionDesc: '' })
      setIsHardDelete(false)
    }

    setShowUnsavedWarning(false)
  }, [permission])

  const hasUnsavedChanges = useMemo(() => {
    if (action === ACTION_TYPE.CREATE) {
      return formData.permissionName.trim() !== '' || formData.permissionDesc.trim() !== ''
    }

    if (action === ACTION_TYPE.UPDATE && permission) {
      return (
        formData.permissionName.trim() !== permission.permissionName ||
        formData.permissionDesc.trim() !== permission.permissionDesc
      )
    }

    return false
  }, [formData, action, permission])

  if (
    !action ||
    ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !permission)
  )
    return null

  const isLoading =
    createPermission.isPending ||
    updatePermission.isPending ||
    deletePermission.isPending ||
    restorePermission.isPending

  const modalConfig = {
    CREATE: {
      title: 'Add New Permission',
      success: 'Permission created successfully!',
      errorPrefix: 'Failed to create permission',
      buttonLabel: 'Create Permission',
    },
    UPDATE: {
      title: 'Update Permission',
      success: 'Permission updated successfully!',
      errorPrefix: 'Failed to update permission',
      buttonLabel: 'Update Permission',
    },
    DELETE: {
      title: `${isHardDelete ? 'Permanently' : ''} Delete Permission`,
      success: `Permission ${isHardDelete ? 'hard' : ''} deleted successfully!`,
      errorPrefix: 'Failed to delete permission',
      buttonLabel: 'Delete',
    },
    RESTORE: {
      title: 'Restore Permission',
      success: 'Permission restored successfully!',
      errorPrefix: 'Failed to restore permission',
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
        await createPermission.mutateAsync(formData)
      } else if (action === ACTION_TYPE.UPDATE && permission?.id) {
        await updatePermission.mutateAsync({
          id: permission.id,
          payload: formData,
        })
      } else if (action === ACTION_TYPE.DELETE && permission?.id) {
        await deletePermission.mutateAsync({
          id: permission.id,
          isHardDelete,
        })
      } else if (action === ACTION_TYPE.RESTORE && permission?.id) {
        await restorePermission.mutateAsync(permission.id)
      }

      showAlert('success', modalConfig.success)
      resetForm()
      closePermissionModal()
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
      closePermissionModal()
    }
  }

  const handleConfirmClose = () => {
    resetForm()
    setShowUnsavedWarning(false)
    closePermissionModal()
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  return (
    <>
      <Dialog open={isPermissionModalOpen} onClose={handleClose} maxWidth='sm' fullWidth>
        {(action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  required
                  label='Permission Name'
                  name='permissionName'
                  value={formData.permissionName}
                  onChange={handleChange}
                  fullWidth
                  disabled={isLoading}
                  placeholder='e.g., READ_USERS, WRITE_REPORTS'
                  helperText='Use uppercase with underscores (e.g., PERMISSION_NAME)'
                />

                <TextField
                  required
                  label='Permission Description'
                  name='permissionDesc'
                  value={formData.permissionDesc}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder='Describe what this permission allows...'
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
        {(action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE) && permission && (
          <>
            <DialogTitle>{modalConfig.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {action === ACTION_TYPE.DELETE
                  ? isHardDelete
                    ? `Are you sure you want to permanently delete "${permission.permissionName}"? This action cannot be undone.`
                    : `Are you sure you want to delete "${permission.permissionName}"?`
                  : action === ACTION_TYPE.RESTORE
                    ? `Are you sure you want to restore "${permission.permissionName}"?`
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
