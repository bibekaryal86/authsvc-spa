import { ACTION_TYPE, DEFAULT_PARAMS, type ModalActionExtended } from '@constants'
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
import { useAuthStore, useProfileStore } from '@stores'
import type { Profile } from '@types'
import React, { useEffect, useMemo, useState } from 'react'

import { ProfilesModal } from './ProfilesModal.tsx'
import { ProfilesTable } from './ProfilesTable.tsx'

export const Profiles: React.FC = () => {
  const { profiles, isLoading, error, fetchProfiles, clearError } = useProfileStore()
  const { isSuperUser } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<ModalActionExtended | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const hasActiveFilters = selectedStatus != 'all'

  useEffect(() => {
    void fetchProfiles(DEFAULT_PARAMS)
  }, [fetchProfiles])

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

  const handleRefresh = () => {
    clearError()
    handleClearFilters()
    void fetchProfiles({
      ...DEFAULT_PARAMS,
      isIncludeDeleted: includeDeleted,
    })
  }

  const handleModalOpen = (profile: Profile | null, action: ModalActionExtended) => {
    setModalAction(action)
    setSelectedProfile(profile)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setSelectedProfile(null)
    setIsModalOpen(false)
  }

  const handleModalSuccess = () => {
    void fetchProfiles(DEFAULT_PARAMS)
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
          <ProfilesModal
            action={modalAction}
            open={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            profile={selectedProfile}
            isSuperUser={isSuperUser}
          />
        )}
      </Paper>
    </Container>
  )
}
