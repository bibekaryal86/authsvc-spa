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
import { useCreateRole, useUpdateRole, useDeleteRole, useRestoreRole } from '@queries'
import { useAlertStore, useAuthStore, useRoleStore } from '@stores'
import type { RoleRequest } from '@types'
import { extractAxiosErrorMessage } from '@utils'
import React, { useState, useCallback, useMemo } from 'react'

export const RolesModal: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const { showAlert } = useAlertStore()

  const { isRoleModalOpen, roleModalAction: action, selectedRole: role, closeRoleModal } = useRoleStore()

  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const restoreRole = useRestoreRole()

  const [formData, setFormData] = useState<RoleRequest>({
    roleName: role ? role.roleName : '',
    roleDesc: role ? role.roleDesc : '',
  })

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [isHardDelete, setIsHardDelete] = useState(false)

  const resetForm = useCallback(() => {
    if (role) {
      setFormData({
        roleName: role.roleName,
        roleDesc: role.roleDesc,
      })
      setIsHardDelete(role.deletedDate !== null)
    } else {
      setFormData({ roleName: '', roleDesc: '' })
      setIsHardDelete(false)
    }
  }, [role])

  const hasUnsavedChanges = useMemo(() => {
    if (action === ACTION_TYPE.CREATE) {
      return formData.roleName.trim() !== '' || formData.roleDesc.trim() !== ''
    }

    if (action === ACTION_TYPE.UPDATE && role) {
      return formData.roleName.trim() !== role.roleName || formData.roleDesc.trim() !== role.roleDesc
    }

    return false
  }, [formData, action, role])

  if (
    !action ||
    ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !role)
  )
    return null

  const isLoading = createRole.isPending || updateRole.isPending || deleteRole.isPending || restoreRole.isPending

  const modalConfig = {
    CREATE: {
      title: 'Add New Role',
      success: 'Role created successfully!',
      errorPrefix: 'Failed to create role',
      buttonLabel: 'Create Role',
    },
    UPDATE: {
      title: 'Update Role',
      success: 'Role updated successfully!',
      errorPrefix: 'Failed to update role',
      buttonLabel: 'Update Role',
    },
    DELETE: {
      title: `${isHardDelete ? 'Permanently' : ''} Delete Role`,
      success: `Role ${isHardDelete ? 'hard' : ''} deleted successfully!`,
      errorPrefix: 'Failed to delete role',
      buttonLabel: 'Delete',
    },
    RESTORE: {
      title: 'Restore Role',
      success: 'Role restored successfully!',
      errorPrefix: 'Failed to restore role',
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
        await createRole.mutateAsync(formData)
      } else if (action === ACTION_TYPE.UPDATE && role?.id) {
        await updateRole.mutateAsync({
          id: role.id,
          payload: formData,
        })
      } else if (action === ACTION_TYPE.DELETE && role?.id) {
        await deleteRole.mutateAsync({
          id: role.id,
          isHardDelete,
        })
      } else if (action === ACTION_TYPE.RESTORE && role?.id) {
        await restoreRole.mutateAsync(role.id)
      }

      showAlert('success', modalConfig.success)
      resetForm()
      closeRoleModal()
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
      closeRoleModal()
    }
  }

  const handleConfirmClose = () => {
    resetForm()
    setShowUnsavedWarning(false)
    closeRoleModal()
  }

  const handleCancelClose = () => setShowUnsavedWarning(false)

  if ((action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE || action === ACTION_TYPE.UPDATE) && !role)
    return null

  return (
    <>
      <Dialog open={isRoleModalOpen} onClose={handleClose} maxWidth='sm' fullWidth>
        {(action === ACTION_TYPE.CREATE || action === ACTION_TYPE.UPDATE) && (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <DialogTitle>
              <Typography fontWeight='bold'>{modalConfig.title}</Typography>
            </DialogTitle>

            <DialogContent>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  required
                  label='Role Name'
                  name='roleName'
                  value={formData.roleName}
                  onChange={handleChange}
                  fullWidth
                  disabled={isLoading}
                  placeholder='e.g., SUPERUSER, ADMIN_USER, GUEST, etc'
                  helperText='Use uppercase with underscores (e.g., ROLE_NAME)'
                />

                <TextField
                  required
                  label='Role Description'
                  name='roleDesc'
                  value={formData.roleDesc}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isLoading}
                  placeholder='Describe what this role can do...'
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
        {(action === ACTION_TYPE.DELETE || action === ACTION_TYPE.RESTORE) && role && (
          <>
            <DialogTitle>{modalConfig.title}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {action === ACTION_TYPE.DELETE
                  ? isHardDelete
                    ? `Are you sure you want to permanently delete "${role.roleName}"? This action cannot be undone.`
                    : `Are you sure you want to delete "${role.roleName}"?`
                  : action === ACTION_TYPE.RESTORE
                    ? `Are you sure you want to restore "${role.roleName}"?`
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
