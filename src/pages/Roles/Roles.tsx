import { EntityTable } from '@components'
import { ACTION_TYPE, DEFAULT_PARAMS, type ModalAction } from '@constants'
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
import { useReadRoles } from '@queries'
import { useAuthStore, useRoleStore } from '@stores'
import type { Role } from '@types'
import React, { useMemo } from 'react'

import { RolesModal } from './RolesModal.tsx'

export const Roles: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const { selectedStatus, isIncludeDeleted, setSelectedStatus, setIncludeDeleted, isRoleModalOpen, openRoleModal } =
    useRoleStore()

  const hasActiveFilters = selectedStatus != 'all'

  const params = { ...DEFAULT_PARAMS, isIncludeDeleted }
  const { data, isLoading, error } = useReadRoles(params)

  const roles = useMemo(() => data?.roles ?? [], [data?.roles])

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const isActive = role.deletedDate === null
      const isDeleted = role.deletedDate !== null
      return (
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isActive) ||
        (selectedStatus === 'deleted' && isDeleted)
      )
    })
  }, [roles, selectedStatus])

  const handleModalOpen = (role: Role | null, action: ModalAction) => {
    openRoleModal(action, role)
  }

  const handleClearFilters = () => {
    setSelectedStatus('all')
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4, flex: 1 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
              Roles
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and configure system roles and access controls.
            </Typography>
          </Box>

          {!error && !isLoading && (
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleModalOpen(null, ACTION_TYPE.CREATE)}
              disabled={isLoading}
            >
              Add Role
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
          </Grid>

          {hasActiveFilters && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedStatus !== 'all' && (
                <Chip label='Showing All Status' onDelete={() => setSelectedStatus('all')} size='small' />
              )}
            </Box>
          )}

          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Showing {filteredRoles.length} of {roles.length} roles
            {hasActiveFilters && ' (filtered)'}
          </Typography>
        </Paper>

        {isLoading && roles.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <EntityTable
          entities={roles}
          isLoading={isLoading}
          onAction={handleModalOpen}
          isSuperUser={isSuperUser}
          entityType='role'
          getName={(r) => r.roleName}
          getDescription={(r) => r.roleDesc}
          getDeletedDate={(r) => r.deletedDate}
          getEntityUrl={(r) => `/roles/${r.id}`}
        />

        {!isLoading && roles.length > 0 && (
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

        {isRoleModalOpen && <RolesModal />}
      </Paper>
    </Container>
  )
}
