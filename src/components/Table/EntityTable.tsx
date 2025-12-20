import { ACTION_TYPE, type ModalAction } from '@constants'
import { Edit, Delete, Restore } from '@mui/icons-material'
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
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { SortLabel } from './SortLabel.tsx'

type SortDirection = 'asc' | 'desc'

interface EntityTableProps<T> {
  entities: T[]
  isLoading: boolean
  onAction: (entity: T, modalAction: ModalAction) => void
  isSuperUser: boolean
  entityType: 'platform' | 'role' | 'permission'
  getName: (entity: T) => string
  getDescription: (entity: T) => string
  getDeletedDate: (entity: T) => Date | null
  getEntityUrl: (entity: T) => string
}

export const EntityTable = <T extends { id: number }>({
  entities,
  isLoading,
  onAction,
  isSuperUser,
  entityType,
  getName,
  getDescription,
  getDeletedDate,
  getEntityUrl,
}: EntityTableProps<T>) => {
  const navigate = useNavigate()
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedEntities = useMemo(() => {
    return [...entities].sort((a, b) => {
      const aValue = getName(a).toLowerCase()
      const bValue = getName(b).toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [entities, sortDirection, getName])

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading {entityType}s...</Typography>
      </Box>
    )
  }

  if (entities.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color='text.secondary'>
          No {entityType}s found. Create your first {entityType} to get started.
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label={`${entityType}s table`}>
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortDirection}>
              <SortLabel active direction={sortDirection} onClick={() => handleSort()}>
                <strong>Name</strong>
              </SortLabel>
            </TableCell>
            <TableCell>
              <strong>Description</strong>
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
          {sortedEntities.map((entity) => {
            const name = getName(entity)
            const desc = getDescription(entity)
            const deletedDate = getDeletedDate(entity)

            return (
              <TableRow key={entity.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Button
                    variant='text'
                    onClick={() => void navigate(getEntityUrl(entity))}
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
                    {name}
                  </Button>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {desc}
                  </Typography>
                </TableCell>
                {isSuperUser && (
                  <TableCell>
                    <Chip
                      label={deletedDate ? 'Inactive' : 'Active'}
                      color={deletedDate ? 'default' : 'success'}
                      size='small'
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={`Edit ${entityType}`}>
                      <IconButton
                        size='small'
                        onClick={() => onAction(entity, ACTION_TYPE.UPDATE)}
                        color='secondary'
                        disabled={name.endsWith('SUPERUSER')}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {!deletedDate && (
                      <Tooltip title={`Delete ${entityType}`}>
                        <IconButton
                          size='small'
                          onClick={() => onAction(entity, ACTION_TYPE.DELETE)}
                          color='error'
                          disabled={name.endsWith('SUPERUSER')}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
                    {isSuperUser && deletedDate && (
                      <>
                        <Tooltip title={`Delete ${entityType}`}>
                          <IconButton
                            size='small'
                            onClick={() => onAction(entity, ACTION_TYPE.DELETE)}
                            color='error'
                            disabled={name.endsWith('SUPERUSER')}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={`Restore ${entityType}`}>
                          <IconButton
                            size='small'
                            onClick={() => onAction(entity, ACTION_TYPE.RESTORE)}
                            color='error'
                            disabled={name.endsWith('SUPERUSER')}
                          >
                            <Restore />
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
