import { HistoryTable, PrpTable } from '@components'
import { PrpModal } from '@components'
import { ACTION_TYPE, DEFAULT_PARAMS, type PrpPprAction } from '@constants'
import { Add, ArrowBack, History } from '@mui/icons-material'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Collapse,
} from '@mui/material'
import { usePermissionStore, useAuthStore } from '@stores'
import type { Permission, PlatformRolePermission } from '@types'
import { getNumber } from '@utils'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export const PermissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoading, error, fetchPermissionById, clearError } = usePermissionStore()
  const { isSuperUser } = useAuthStore()
  const [permission, setPermission] = useState<Permission | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [isPrpModalOpen, setIsPrpModalOpen] = useState(false)
  const [selectedPrp, setSelectedPrp] = useState<PlatformRolePermission | null>(null)
  const [prpModalAction, setPrpModalAction] = useState<PrpPprAction | null>(null)

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const loadPermission = async () => {
      const foundPermission = await fetchPermissionById(getNumber(id), { ...DEFAULT_PARAMS, isForceFetch: true })
      if (isMounted) {
        setPermission(foundPermission)
        setLoading(false)
      }
    }

    void loadPermission()

    return () => {
      isMounted = false
    }
  }, [id, fetchPermissionById])

  const handleBack = () => {
    void navigate(-1)
  }

  const handleBackToPermissions = () => {
    void navigate('/permissions')
  }

  const handleDeletedLookup = async () => {
    const foundPermission = await fetchPermissionById(getNumber(id), {
      ...DEFAULT_PARAMS,
      isIncludeDeleted: true,
      isForceFetch: true,
    })
    setPermission(foundPermission)
  }

  const handleViewHistory = async () => {
    setShowHistory(!showHistory)
    if (permission && (!permission.history || permission.history.length === 0)) {
      const foundPermission = await fetchPermissionById(getNumber(id), {
        ...DEFAULT_PARAMS,
        isIncludeHistory: true,
        isForceFetch: true,
      })
      setPermission(foundPermission)
    }
  }

  const handlePrpModalOpen = (action: PrpPprAction, selectedPrp: PlatformRolePermission | null) => {
    setSelectedPrp(selectedPrp)
    setPrpModalAction(action)
    setIsPrpModalOpen(true)
  }

  const handlePrpModalClose = () => {
    setPrpModalAction(null)
    setSelectedPrp(null)
    setIsPrpModalOpen(false)
  }

  const handlePrpModalSuccess = async () => {
    const updatedPermission = await fetchPermissionById(getNumber(id), {
      ...DEFAULT_PARAMS,
      isForceFetch: true,
    })
    setPermission(updatedPermission)
    setPrpModalAction(null)
    setSelectedPrp(null)
  }

  if (loading || isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
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
                clearError()
                handleBackToPermissions()
              }}
            >
              Go to Permissions
            </Button>
          }
        >
          {error}
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

          <Collapse in={showHistory}>
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
      </Container>
      <PrpModal
        open={isPrpModalOpen}
        onClose={handlePrpModalClose}
        onSuccess={() => void handlePrpModalSuccess()}
        action={prpModalAction}
        initEntity='permission'
        selectedEntity={permission}
        selectedPrp={selectedPrp}
      />
    </>
  )
}
