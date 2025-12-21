import { HistoryTable, PrpModal, PrpTable, Spinner } from '@components'
import { ACTION_TYPE, DEFAULT_PARAMS, type PrpPprAction } from '@constants'
import { Add, ArrowBack, History } from '@mui/icons-material'
import {
  Alert,
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
} from '@mui/material'
import { useReadPermissionById } from '@queries'
import { usePermissionStore, useAuthStore } from '@stores'
import type { PlatformRolePermission } from '@types'
import { getNumber } from '@utils'
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export const PermissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSuperUser } = useAuthStore()

  const { isShowHistory, setShowHistory, selectedPermission, setSelectedPermission, openPrpModal, setIncludeDeleted } =
    usePermissionStore()

  const permissionId = getNumber(id)
  const {
    data: permission,
    isLoading,
    error,
  } = useReadPermissionById(permissionId, { ...DEFAULT_PARAMS, isForceFetch: true, isIncludeHistory: isShowHistory })

  useEffect(() => {
    setSelectedPermission(permission ?? null)
  }, [permission, setSelectedPermission])

  const handleBack = () => {
    void navigate(-1)
  }

  const handleBackToPermissions = () => {
    void navigate('/permissions')
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
                handleBackToPermissions()
              }}
            >
              Go to Permissions
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
                Lookup Deleted Permission
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted permissions.
          </Alert>
        )}
      </Container>
    )
  }

  if (!permission) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert
          severity='warning'
          action={
            <>
              <Button color='inherit' size='small' onClick={handleBack} sx={{ mr: 1 }}>
                Go Back
              </Button>
              <Button color='inherit' size='small' onClick={handleBackToPermissions}>
                Permissions
              </Button>
            </>
          }
        >
          Permission not found
        </Alert>

        {isSuperUser && (
          <Alert
            severity='info'
            sx={{ mt: 2 }}
            action={
              <Button color='inherit' size='small' onClick={() => void handleDeletedLookup()}>
                Lookup Deleted Permission
              </Button>
            }
          >
            As a superuser, you can attempt to lookup deleted permissions.
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

          <Button onClick={handleBackToPermissions} variant='outlined'>
            Back to Permissions
          </Button>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
              {permission.permissionName}
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
                        Permission Name
                      </Typography>
                      <Typography variant='body1' fontWeight='medium'>
                        {permission.permissionName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Description
                      </Typography>
                      <Typography variant='body1'>{permission.permissionDesc}</Typography>
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
                        Permission ID
                      </Typography>
                      <Typography variant='body2' fontFamily='monospace'>
                        {permission.id}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Created Date
                      </Typography>
                      <Typography variant='body2'>{new Date(permission.createdDate).toLocaleString()}</Typography>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Last Modified
                      </Typography>
                      <Typography variant='body2'>{new Date(permission.updatedDate).toLocaleString()}</Typography>
                    </Box>

                    {permission.deletedDate && (
                      <Box>
                        <Typography variant='caption' color='text.secondary'>
                          Deleted Date
                        </Typography>
                        <Typography variant='body2' color='error'>
                          {new Date(permission.deletedDate).toLocaleString()}
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
                  Platform Role Assignments
                </Typography>
                <Typography variant='body2' color='text.secondary' paragraph>
                  Lists all platform roles where this permission is assigned
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
              prpList={permission?.platformRolePermissions || []}
              entityType='permission'
              onUnassignClick={(prp) => handlePrpModalOpen(ACTION_TYPE.UNASSIGN, prp)}
              isSuperUser
            />
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button variant='outlined' startIcon={<History />} onClick={() => void handleViewHistory()} size='large'>
              View Permission History
            </Button>
          </Box>

          <Collapse in={isShowHistory}>
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='h6' gutterBottom fontWeight='medium'>
                Permission History
              </Typography>

              <HistoryTable
                history={permission?.history || []}
                emptyMessage='No history available for this permission'
                formatEventType={(eventType) => eventType.replace('PERMISSION_', '').replace('_', ' ')}
              />

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button size='small' onClick={() => setShowHistory(false)}>
                  Hide History
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Paper>
        <PrpModal initEntity='permission' selectedEntity={selectedPermission} />
      </Container>
    </>
  )
}
