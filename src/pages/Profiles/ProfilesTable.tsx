import { SortLabel } from '@components'
import { ACTION_TYPE, type ModalActionExtended } from '@constants'
import { Edit, Email, Password, Delete, Restore, CheckCircle, Refresh } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import type { Profile } from '@types'
import { getUserFullName } from '@utils'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SortDirection = 'asc' | 'desc'

interface ProfileTableProps {
  profiles: Profile[]
  isLoading: boolean
  onAction: (profile: Profile, modalAction: ModalActionExtended) => void
  isSuperUser: boolean
}

export const ProfilesTable = ({ profiles, isLoading, onAction, isSuperUser }: ProfileTableProps) => {
  const navigate = useNavigate()
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedEntities = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const aValue = a.lastName.toLowerCase()
      const bValue = b.lastName.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [profiles, sortDirection])

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading profiles...</Typography>
      </Box>
    )
  }

  if (profiles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color='text.secondary'>No profiles found.</Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='profiles table'>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortDirection}>
              <SortLabel active direction={sortDirection} onClick={() => handleSort()}>
                <strong>Name</strong>
              </SortLabel>
            </TableCell>
            <TableCell>
              <strong>Email</strong>
            </TableCell>
            <TableCell>
              <strong>Phone</strong>
            </TableCell>
            {isSuperUser && (
              <TableCell>
                <strong>Active</strong>
              </TableCell>
            )}
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedEntities.map((profile) => {
            return (
              <TableRow key={profile.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Button
                    variant='text'
                    onClick={() => void navigate(`/profiles/${profile.id}`)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'medium',
                      textAlign: 'left',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        textDecoration: 'underline',
                        backgroundColor: 'transparent',
                      },
                    }}
                  >
                    {getUserFullName(profile)}
                  </Button>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {profile.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {profile.phone}
                  </Typography>
                </TableCell>
                {isSuperUser && (
                  <TableCell>
                    <Chip
                      label={profile.deletedDate ? 'Inactive' : 'Active'}
                      color={profile.deletedDate ? 'default' : 'success'}
                      size='small'
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={'Edit profile'}>
                      <IconButton size='small' onClick={() => onAction(profile, ACTION_TYPE.UPDATE)} color='secondary'>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={'Update Email'}>
                      <IconButton size='small' onClick={() => onAction(profile, ACTION_TYPE.UPDATE_EMAIL)} color='info'>
                        <Email />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={'Update Password'}>
                      <IconButton
                        size='small'
                        onClick={() => onAction(profile, ACTION_TYPE.UPDATE_PASSWORD)}
                        color='warning'
                      >
                        <Password />
                      </IconButton>
                    </Tooltip>
                    {isSuperUser && (
                      <>
                        <Tooltip title={'Delete profile'}>
                          <IconButton size='small' onClick={() => onAction(profile, ACTION_TYPE.DELETE)} color='error'>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        {profile.deletedDate && (
                          <Tooltip title={'Restore profile'}>
                            <IconButton
                              size='small'
                              onClick={() => onAction(profile, ACTION_TYPE.RESTORE)}
                              color='error'
                            >
                              <Restore />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={'Validate profile'}>
                          <IconButton
                            size='small'
                            onClick={() => onAction(profile, ACTION_TYPE.VALIDATE)}
                            color='error'
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={'Reset profile'}>
                          <IconButton size='small' onClick={() => onAction(profile, ACTION_TYPE.RESET)} color='error'>
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
