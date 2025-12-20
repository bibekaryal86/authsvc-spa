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
  IconButton,
  Tooltip,
} from '@mui/material'
import type { PlatformRolePermission } from '@types'
import { getFormattedDate } from '@utils'
import React from 'react'

interface PrpTableProps {
  prpList: PlatformRolePermission[]
  entityType: 'platform' | 'role' | 'permission'
  onUnassignClick: (prp: PlatformRolePermission) => void
  isSuperUser: boolean
}

export const PrpTable: React.FC<PrpTableProps> = ({ prpList, entityType, onUnassignClick, isSuperUser }) => {
  if (!prpList || prpList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color='text.secondary'>No platform role permission assignments found...</Typography>
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
              {entityType !== 'role' && <TableCell>Role</TableCell>}
              {entityType !== 'permission' && <TableCell>Permission</TableCell>}
              <TableCell>Assigned</TableCell>
              <TableCell>Unassigned</TableCell>
              <TableCell>Status</TableCell>
              {isSuperUser && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {prpList.map((item, index) => (
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
                {item.permission && (
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {item.permission.permissionName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      {item.permission.permissionDesc}
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
          Showing {prpList.length} role permission assignment(s)
        </Typography>
      </Box>
    </>
  )
}
