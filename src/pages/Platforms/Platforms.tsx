import { EntityTable } from '@components'
import { ACTION_TYPE, DEFAULT_PARAMS, type ModalAction } from '@constants'
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
import { useAuthStore, usePlatformStore } from '@stores'
import type { Platform } from '@types'
import React, { useEffect, useMemo, useState } from 'react'

import { PlatformsModal } from './PlatformsModal.tsx'

export const Platforms: React.FC = () => {
  const { platforms, isLoading, error, fetchPlatforms, clearError } = usePlatformStore()
  const { isSuperUser } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<ModalAction | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const hasActiveFilters = selectedStatus != 'all'

  useEffect(() => {
    void fetchPlatforms(DEFAULT_PARAMS)
  }, [fetchPlatforms])

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      const isActive = platform.deletedDate === null
      const isDeleted = platform.deletedDate !== null
      return (
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && isActive) ||
        (selectedStatus === 'deleted' && isDeleted)
      )
    })
  }, [platforms, selectedStatus])

  const handleRefresh = () => {
    clearError()
    handleClearFilters()
    void fetchPlatforms({
      ...DEFAULT_PARAMS,
      isIncludeDeleted: includeDeleted,
    })
  }

  const handleModalOpen = (platform: Platform | null, action: ModalAction) => {
    setModalAction(action)
    setSelectedPlatform(platform)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setSelectedPlatform(null)
    setIsModalOpen(false)
  }

  const handleModalSuccess = () => {
    void fetchPlatforms(DEFAULT_PARAMS)
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
              Platforms
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and configure system platforms and access controls.
            </Typography>
          </Box>

          {!error && !isLoading && (
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => handleModalOpen(null, ACTION_TYPE.CREATE)}
              disabled={isLoading}
            >
              Add Platform
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
            Showing {filteredPlatforms.length} of {platforms.length} platforms
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

        {isLoading && platforms.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <EntityTable
          entities={platforms}
          isLoading={isLoading}
          onAction={handleModalOpen}
          isSuperUser={isSuperUser}
          entityType='platform'
          getName={(p) => p.platformName}
          getDescription={(p) => p.platformDesc}
          getDeletedDate={(p) => p.deletedDate}
          getEntityUrl={(p) => `/platforms/${p.id}`}
        />

        {!isLoading && platforms.length > 0 && (
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
          <PlatformsModal
            action={modalAction}
            open={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
            platform={selectedPlatform}
            isSuperUser={isSuperUser}
          />
        )}
      </Paper>
    </Container>
  )
}
