import { Delete } from '@mui/icons-material'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  Tooltip,
  IconButton,
} from '@mui/material'
import type { PlatformProfileRole } from '@types'
import { getFormattedDate, getUserFullName } from '@utils'
import React from 'react'

interface PprTableProps {
  pprList: PlatformProfileRole[]
  entityType: 'platform' | 'profile' | 'role'
  onUnassignClick: (ppr: PlatformProfileRole) => void
  isSuperUser: boolean
}

export const PprTable: React.FC<PprTableProps> = ({ pprList, entityType, onUnassignClick, isSuperUser }) => {
  if (!pprList || pprList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color='text.secondary'>No platform profile role assignment found...</Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              {entityType !== 'platform' && <TableCell>Platform</TableCell>}
              {entityType !== 'profile' && <TableCell>Profile</TableCell>}
              {entityType !== 'role' && <TableCell>Role</TableCell>}
              <TableCell>Assigned Date</TableCell>
              <TableCell>Unassigned Date</TableCell>
              <TableCell>Status</TableCell>
              {isSuperUser && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {pprList.map((item, index) => (
              <TableRow key={index} hover>
                {item.platform && (
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {item.platform.platformName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      {item.platform.platformDesc}
                    </Typography>
                  </TableCell>
                )}
                {item.profile && (
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {getUserFullName(item.profile)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      {item.profile.email}
                    </Typography>
                  </TableCell>
                )}
                {item.role && (
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {item.role.roleName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      {item.role.roleDesc}
                    </Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant='body2'>{getFormattedDate(item.assignedDate)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{getFormattedDate(item.unassignedDate)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.unassignedDate ? 'Inactive' : 'Active'}
                    size='small'
                    color={item.unassignedDate ? 'default' : 'success'}
                    variant='outlined'
                  />
                </TableCell>
                {isSuperUser && (
                  <TableCell>
                    <Tooltip title={`Delete ${entityType}`}>
                      <IconButton size='small' onClick={() => onUnassignClick(item)} color='error'>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Showing {pprList.length} platform profile role assignment(s)
        </Typography>
      </Box>
    </>
  )
}
