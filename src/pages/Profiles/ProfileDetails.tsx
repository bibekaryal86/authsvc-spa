import { HistoryTable, PprTable, Spinner } from '@components'
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
import { useReadProfileById } from '@queries'
import { useProfileStore, useAuthStore } from '@stores'
import type { PlatformProfileRole } from '@types'
import { getNumber, getUserFullName } from '@utils'
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export const ProfileDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSuperUser } = useAuthStore()

  const { isShowHistory, setShowHistory, setSelectedProfile, openPprModal, setIncludeDeleted } = useProfileStore()

  const profileId = getNumber(id)
  const {
    data: profile,
    isLoading,
    error,
  } = useReadProfileById(profileId, { ...DEFAULT_PARAMS, isForceFetch: true, isIncludeHistory: isShowHistory })

  useEffect(() => {
    setSelectedProfile(profile ?? null)
  }, [profile, setSelectedProfile])

  const handleBack = () => {
    void navigate(-1)
  }

  const handleBackToProfiles = () => {
    void navigate('/profiles')
  }

  const handleViewHistory = async () => {
    setShowHistory(!isShowHistory)
  }

  const handleDeletedLookup = async () => {
    setIncludeDeleted(true)
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
                handleBackToProfiles()
              }}
            >
              Go to Profiles
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
                Lookup Deleted Profile
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted profiles.
          </Alert>
        )}
      </Container>
    )
  }

  if (!profile) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert
          severity='warning'
          action={
            <>
              <Button color='inherit' size='small' onClick={handleBack} sx={{ mr: 1 }}>
                Go Back
              </Button>
              <Button color='inherit' size='small' onClick={handleBackToProfiles}>
                Profiles
              </Button>
            </>
          }
        >
          Profile not found
        </Alert>

        {isSuperUser && (
          <Alert
            severity='info'
            sx={{ mt: 2 }}
            action={
              <Button color='inherit' size='small' onClick={() => void handleDeletedLookup()}>
                Lookup Deleted Profile
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted profiles.
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

          <Button onClick={handleBackToProfiles} variant='outlined'>
            Back to Profiles
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
              {getUserFullName(profile)}
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
                        Full Name
                      </Typography>
                      <Typography variant='body1' fontWeight='medium'>
                        {getUserFullName(profile)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Email
                      </Typography>
                      <Typography variant='body1'>{profile.email || 'Not provided'}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Phone
                      </Typography>
                      <Typography variant='body1'>{profile.phone || 'Not provided'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              {profile.profileAddress && (
                <Card variant='outlined' sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant='h6' gutterBottom fontWeight='medium'>
                      Address Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Street
                        </Typography>
                        <Typography variant='body1'>{profile.profileAddress.street}</Typography>
                      </Box>

                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          City, State, Postal Code
                        </Typography>
                        <Typography variant='body1'>
                          {profile.profileAddress.city}, {profile.profileAddress.state}{' '}
                          {profile.profileAddress.postalCode}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Country
                        </Typography>
                        <Typography variant='body1'>{profile.profileAddress.country || 'Not specified'}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}
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
                        Profile ID
                      </Typography>
                      <Typography variant='body2' fontFamily='monospace'>
                        {profile.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Created Date
                      </Typography>
                      <Typography variant='body2'>{new Date(profile.createdDate).toLocaleString()}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Last Modified
                      </Typography>
                      <Typography variant='body2'>{new Date(profile.updatedDate).toLocaleString()}</Typography>
                    </Box>

                    {profile.deletedDate && (
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Deleted Date
                        </Typography>
                        <Typography variant='body2' color='error'>
                          {new Date(profile.deletedDate).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Validated
                      </Typography>
                      <Typography variant='body2'>{profile.isValidated ? 'Yes' : 'No'}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Login Attempts
                      </Typography>
                      <Typography variant='body2'>{profile.loginAttempts || 0}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Last Login Date
                      </Typography>
                      <Typography variant='body2'>
                        {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}
                      </Typography>
                    </Box>

                    {profile.profileAddress && (
                      <Box>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Profile Address ID
                          </Typography>
                          <Typography variant='body2' fontFamily='monospace'>
                            {profile.profileAddress.id || 'None'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Profile Address Created Date
                          </Typography>
                          <Typography variant='body2'>
                            {new Date(profile.profileAddress.createdDate).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Profile Address Last Modified
                          </Typography>
                          <Typography variant='body2'>
                            {new Date(profile.profileAddress.updatedDate).toLocaleString()}
                          </Typography>
                        </Box>
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
                  Platform Role Assignments
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Lists all platform roles where this profile is assigned
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
              pprList={profile?.platformProfileRoles || []}
              entityType='profile'
              onUnassignClick={(ppr) => handlePprModalOpen(ACTION_TYPE.UNASSIGN, ppr)}
              isSuperUser
            />
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button variant='outlined' startIcon={<History />} onClick={() => void handleViewHistory()} size='large'>
              View Profile History
            </Button>
          </Box>

          <Collapse in={isShowHistory}>
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='h6' gutterBottom fontWeight='medium'>
                Profile History
              </Typography>

              <HistoryTable
                history={profile?.history || []}
                emptyMessage='No history available for this profile'
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
