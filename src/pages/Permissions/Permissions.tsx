import { EntityTable } from '@components'
import { ACTION_TYPE, type ModalAction, DEFAULT_PARAMS } from '@constants'
import { Add, FilterList } from '@mui/icons-material'
import {
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
import { useReadPermissions } from '@queries'
import { usePermissionStore, useAuthStore } from '@stores'
import type { Permission } from '@types'
import React, { useMemo } from 'react'

import { PermissionsModal } from './PermissionsModal.tsx'

export const Permissions: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const {
    selectedStatus,
    selectedPlatform,
    isIncludeDeleted,
    setSelectedStatus,
    setSelectedPlatform,
    setIncludeDeleted,
    isPermissionModalOpen,
    openPermissionModal,
  } = usePermissionStore()

  const hasActiveFilters = selectedStatus != 'all' || selectedPlatform !== 'all'

  const params = { ...DEFAULT_PARAMS, isIncludeDeleted }
  const { data, isLoading, error } = useReadPermissions(params)

  const permissions = useMemo(() => data?.permissions ?? [], [data?.permissions])
  const platformNames = useMemo(() => data?.platformNames ?? [], [data?.platformNames])

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

  const handleModalOpen = (permission: Permission | null, action: ModalAction) => {
    openPermissionModal(action, permission)
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
                    checked={isIncludeDeleted}
                    onChange={(e) => setIncludeDeleted(e.target.checked)}
                    size='small'
                    disabled={isLoading}
                  />
                }
                label='Include Deleted'
                sx={{ mr: 2 }}
              />
            )}
          </Box>
        )}
        {isPermissionModalOpen && <PermissionsModal />}
      </Paper>
    </Container>
  )
}
