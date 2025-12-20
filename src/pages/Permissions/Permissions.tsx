import { EntityTable } from '@components'
import { ACTION_TYPE, type ModalAction, DEFAULT_PARAMS } from '@constants'
import { Add, FilterList } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material'
import { usePermissionStore, useAuthStore } from '@stores'
import type { Permission } from '@types'
import React, { useEffect, useMemo, useState } from 'react'

import { PermissionsModal } from './PermissionsModal.tsx'

export const Permissions: React.FC = () => {
  const { permissions, platformNames, isLoading, error, fetchPermissions, clearError } = usePermissionStore()
  const { isSuperUser } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<ModalAction | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const hasActiveFilters = selectedStatus != 'all' || selectedPlatform !== 'all'

  useEffect(() => {
    void fetchPermissions(DEFAULT_PARAMS)
  }, [fetchPermissions])

  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const isActive = permission.deletedDate === null
      const isDeleted = permission.deletedDate !== null
      const statusMatch =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isActive) ||
        (selectedStatus === 'deleted' && isDeleted)
      const platformMatch = selectedPlatform === 'all' || permission.permissionName.startsWith(selectedPlatform)
      return statusMatch && platformMatch
    })
  }, [permissions, selectedStatus, selectedPlatform])

  const handleRefresh = () => {
    clearError()
    handleClearFilters()
    void fetchPermissions({
      ...DEFAULT_PARAMS,
      isIncludeDeleted: includeDeleted,
    })
  }

  const handleModalOpen = (permission: Permission | null, action: ModalAction) => {
    setModalAction(action)
    setSelectedPermission(permission)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setSelectedPermission(null)
    setIsModalOpen(false)
  }

  const handleModalSuccess = () => {
    void fetchPermissions(DEFAULT_PARAMS)
  }

  const handleClearFilters = () => {
    setSelectedStatus('all')
    setSelectedPlatform('all')
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4, flex: 1 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
              Permissions
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and configure system permissions and access controls.
            </Typography>
          </Box>

          {!error && !isLoading && (
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleModalOpen(null, ACTION_TYPE.CREATE)}
              disabled={isLoading}
            >
              Add Permission
            </Button>
          )}
        </Box>

        <Paper variant='outlined' sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant='h6' fontWeight='medium'>
              Filters
            </Typography>
            {hasActiveFilters && <Chip label='Clear All' size='small' onClick={handleClearFilters} sx={{ ml: 2 }} />}
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select value={selectedStatus} label='Status' onChange={(e) => setSelectedStatus(e.target.value)}>
                  <MenuItem value='all'>All Status</MenuItem>
                  <MenuItem value='active'>Active Only</MenuItem>
                  <MenuItem value='deleted'>Deleted Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size='small'>
                <InputLabel>Platform</InputLabel>
                <Select value={selectedPlatform} label='Platform' onChange={(e) => setSelectedPlatform(e.target.value)}>
                  <MenuItem value='all'>All Platforms</MenuItem>
                  {platformNames.map((platform) => (
                    <MenuItem key={platform} value={platform}>
                      {platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {hasActiveFilters && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedStatus !== 'all' && (
                <Chip label='Showing All Status' onDelete={() => setSelectedStatus('all')} size='small' />
              )}
              {selectedPlatform !== 'all' && (
                <Chip
                  label={`Platform: ${selectedPlatform}`}
                  onDelete={() => setSelectedPlatform('all')}
                  size='small'
                />
              )}
            </Box>
          )}

          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Showing {filteredPermissions.length} of {permissions.length} permissions
            {hasActiveFilters && ' (filtered)'}
          </Typography>
        </Paper>

        {error && (
          <Alert
            severity='error'
            sx={{ mb: 3 }}
            action={
              <Button color='inherit' size='small' onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {isLoading && permissions.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <EntityTable
          entities={permissions}
          isLoading={isLoading}
          onAction={handleModalOpen}
          isSuperUser={isSuperUser}
          entityType='permission'
          getName={(p) => p.permissionName}
          getDescription={(p) => p.permissionDesc}
          getDeletedDate={(p) => p.deletedDate}
          getEntityUrl={(p) => `/permissions/${p.id}`}
        />

        {!isLoading && permissions.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, alignItems: 'center', gap: 2 }}>
            {isSuperUser && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeDeleted}
                    onChange={(e) => setIncludeDeleted(e.target.checked)}
                    size='small'
                    disabled={isLoading}
                  />
                }
                label='Include Deleted'
                sx={{ mr: 2 }}
              />
            )}
            <Button
              variant='outlined'
              onClick={handleRefresh}
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        )}

        {modalAction && (
          <PermissionsModal
            action={modalAction}
            open={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            permission={selectedPermission}
            isSuperUser={isSuperUser}
          />
        )}
      </Paper>
    </Container>
  )
}
