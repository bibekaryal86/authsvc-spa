import { ACTION_TYPE, DEFAULT_PARAMS, type ModalActionExtended } from '@constants'
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
import { useReadProfiles } from '@queries'
import { useAuthStore, useProfileStore } from '@stores'
import type { Profile } from '@types'
import React, { useMemo } from 'react'

import { ProfilesModal } from './ProfilesModal.tsx'
import { ProfilesTable } from './ProfilesTable.tsx'

export const Profiles: React.FC = () => {
  const { isSuperUser } = useAuthStore()
  const {
    selectedStatus,
    isIncludeDeleted,
    setSelectedStatus,
    setIncludeDeleted,
    isProfileModalOpen,
    openProfileModal,
  } = useProfileStore()

  const hasActiveFilters = selectedStatus != 'all'

  const params = { ...DEFAULT_PARAMS, isIncludeDeleted }
  const { data, isLoading, error } = useReadProfiles(params)

  const profiles = useMemo(() => data?.profiles ?? [], [data?.profiles])

  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      const isActive = profile.deletedDate === null
      const isDeleted = profile.deletedDate !== null
      return (
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isActive) ||
        (selectedStatus === 'deleted' && isDeleted)
      )
    })
  }, [profiles, selectedStatus])

  const handleModalOpen = (profile: Profile | null, action: ModalActionExtended) => {
    openProfileModal(action, profile)
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
              Profiles
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and configure system profiles and access controls.
            </Typography>
          </Box>

          {!error && !isLoading && isSuperUser && (
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleModalOpen(null, ACTION_TYPE.CREATE)}
              disabled={isLoading}
            >
              Add Profile
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
            Showing {filteredProfiles.length} of {profiles.length} profiles
            {hasActiveFilters && ' (filtered)'}
          </Typography>
        </Paper>

        {isLoading && profiles.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <ProfilesTable profiles={profiles} isLoading={isLoading} onAction={handleModalOpen} isSuperUser={isSuperUser} />

        {!isLoading && profiles.length > 0 && (
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

        {isProfileModalOpen && <ProfilesModal />}
      </Paper>
    </Container>
  )
}
