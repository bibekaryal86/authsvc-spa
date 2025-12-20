import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import type { Profile } from '@types'
import { getUserFullName } from '@utils'
import { useMemo, useState } from 'react'

interface SortConfig {
  key: 'createdAt' | 'eventType'
  direction: 'asc' | 'desc'
}

interface AuditItem {
  id: number
  eventType: string
  eventDesc: string
  createdAt: string
  createdBy: Profile
}

interface HistoryTableProps<T extends AuditItem> {
  history: T[]
  emptyMessage: string
  formatEventType: (eventType: string) => string
}

export const HistoryTable = <T extends AuditItem>({ history, emptyMessage, formatEventType }: HistoryTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  })

  const sortedHistory = useMemo(() => {
    if (!history.length) return []
    return [...history].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [history, sortConfig])

  const handleSort = (key: 'createdAt' | 'eventType') => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  if (history.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color='text.secondary'>{emptyMessage}</Typography>
      </Box>
    )
  }

  function getEventTypeColor(eventType: string) {
    if (eventType.includes('CREATE')) return 'success'
    if (eventType.includes('RESTORE')) return 'warning'
    if (eventType.includes('UPDATE')) return 'info'
    if (eventType.includes('DELETE')) return 'error'
    if (eventType.includes('ASSIGN')) return 'success'
    if (eventType.includes('UNASSIGN')) return 'error'
    return 'default'
  }

  return (
    <>
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'createdAt'}
                  direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'desc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'eventType'}
                  direction={sortConfig.key === 'eventType' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('eventType')}
                >
                  Event Type
                </TableSortLabel>
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedHistory.map((historyItem) => (
              <TableRow key={historyItem.id} hover>
                <TableCell>
                  <Typography variant='body2'>{new Date(historyItem.createdAt).toLocaleString()}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={formatEventType(historyItem.eventType)}
                    size='small'
                    color={getEventTypeColor(historyItem.eventType)}
                    variant='outlined'
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{getUserFullName(historyItem.createdBy)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{historyItem.eventDesc}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          Showing {sortedHistory.length} history events
        </Typography>
      </Box>
    </>
  )
}
