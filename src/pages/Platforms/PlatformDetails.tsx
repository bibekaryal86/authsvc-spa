import { HistoryTable, PprTable, PrpTable, Spinner } from '@components'
import { ACTION_TYPE, DEFAULT_PARAMS, type PrpPprAction } from '@constants'
import { Add, ArrowBack, History } from '@mui/icons-material'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
} from '@mui/material'
import { useReadPlatformById } from '@queries'
import { usePlatformStore, useAuthStore } from '@stores'
import type { PlatformProfileRole, PlatformRolePermission } from '@types'
import { getNumber } from '@utils'
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export const PlatformDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSuperUser } = useAuthStore()
  const { isShowHistory, setShowHistory, setSelectedPlatform, openPrpModal, openPprModal, setIncludeDeleted } =
    usePlatformStore()

  const platformId = getNumber(id)
  const {
    data: platform,
    isLoading,
    error,
  } = useReadPlatformById(platformId, { ...DEFAULT_PARAMS, isForceFetch: true, isIncludeHistory: isShowHistory })

  useEffect(() => {
    setSelectedPlatform(platform ?? null)
  }, [platform, setSelectedPlatform])

  const handleBack = () => {
    void navigate(-1)
  }

  const handleBackToPlatforms = () => {
    void navigate('/platforms')
  }

  const handleViewHistory = async () => {
    setShowHistory(!isShowHistory)
  }

  const handleDeletedLookup = async () => {
    setIncludeDeleted(true)
  }

  const handlePrpModalOpen = (action: PrpPprAction, selectedPrp: PlatformRolePermission | null) => {
    openPrpModal(action, selectedPrp)
  }

  const handlePprModalOpen = (action: PrpPprAction, selectedPpr: PlatformProfileRole | null) => {
    openPprModal(action, selectedPpr)
  }

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert
          severity='error'
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => {
                handleBackToPlatforms()
              }}
            >
              Go to Platforms
            </Button>
          }
        >
          {error.message}
        </Alert>
        {isSuperUser && (
          <Alert
            severity='info'
            sx={{ mt: 2 }}
            action={
              <Button color='inherit' size='small' onClick={() => void handleDeletedLookup()}>
                Lookup Deleted Platform
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted platforms.
          </Alert>
        )}
      </Container>
    )
  }

  if (!platform) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert
          severity='warning'
          action={
            <>
              <Button color='inherit' size='small' onClick={handleBack} sx={{ mr: 1 }}>
                Go Back
              </Button>
              <Button color='inherit' size='small' onClick={handleBackToPlatforms}>
                Platforms
              </Button>
            </>
          }
        >
          Platform not found
        </Alert>

        {isSuperUser && (
          <Alert
            severity='info'
            sx={{ mt: 2 }}
            action={
              <Button color='inherit' size='small' onClick={() => void handleDeletedLookup()}>
                Lookup Deleted Platform
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted platforms.
          </Alert>
        )}
      </Container>
    )
  }

  return (
    <>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={handleBack} variant='outlined'>
            Back
          </Button>

          <Button onClick={handleBackToPlatforms} variant='outlined'>
            Back to Platforms
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
              {platform.platformName}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom fontWeight='medium'>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Platform Name
                      </Typography>
                      <Typography variant='body1' fontWeight='medium'>
                        {platform.platformName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Description
                      </Typography>
                      <Typography variant='body1'>{platform.platformDesc}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='h6' gutterBottom fontWeight='medium'>
                    System Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Platform ID
                      </Typography>
                      <Typography variant='body2' fontFamily='monospace'>
                        {platform.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Created Date
                      </Typography>
                      <Typography variant='body2'>{new Date(platform.createdDate).toLocaleString()}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Last Modified
                      </Typography>
                      <Typography variant='body2'>{new Date(platform.updatedDate).toLocaleString()}</Typography>
                    </Box>

                    {platform.deletedDate && (
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Deleted Date
                        </Typography>
                        <Typography variant='body2' color='error'>
                          {new Date(platform.deletedDate).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <div>
                <Typography variant='h6' gutterBottom fontWeight='medium'>
                  Platform Permission Assignments
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Lists all platform permissions where this platform is assigned
                </Typography>
              </div>
              {isSuperUser && (
                <Button
                  variant='contained'
                  startIcon={<Add />}
                  onClick={() => handlePrpModalOpen(ACTION_TYPE.ASSIGN, null)}
                  size='medium'
                >
                  Assign PRP
                </Button>
              )}
            </Box>
            <PrpTable
              prpList={platform?.platformRolePermissions || []}
              entityType='platform'
              onUnassignClick={(prp) => handlePrpModalOpen(ACTION_TYPE.UNASSIGN, prp)}
              isSuperUser
            />
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <div>
                <Typography variant='h6' gutterBottom fontWeight='medium'>
                  Platform Profile Assignments
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Lists all platform profiles where this platform is assigned
                </Typography>
              </div>
              {isSuperUser && (
                <Button
                  variant='contained'
                  startIcon={<Add />}
                  onClick={() => handlePprModalOpen(ACTION_TYPE.ASSIGN, null)}
                  size='medium'
                >
                  Assign PPR
                </Button>
              )}
            </Box>
            <PprTable
              pprList={platform?.platformProfileRoles || []}
              entityType='platform'
              onUnassignClick={(ppr) => handlePprModalOpen(ACTION_TYPE.UNASSIGN, ppr)}
              isSuperUser
            />
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button variant='outlined' startIcon={<History />} onClick={() => void handleViewHistory()} size='large'>
              View Platform History
            </Button>
          </Box>

          <Collapse in={isShowHistory}>
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='h6' gutterBottom fontWeight='medium'>
                Platform History
              </Typography>

              <HistoryTable
                history={platform?.history || []}
                emptyMessage='No history available for this platform'
                formatEventType={(eventType) => eventType.replace('PLATFORM_', '').replace('_', ' ')}
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size='small' onClick={() => setShowHistory(false)}>
                  Hide History
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>
      </Container>
    </>
  )
}
