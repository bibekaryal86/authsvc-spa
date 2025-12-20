import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import { TableSortLabel } from '@mui/material'
import React from 'react'

export const SortLabel: React.FC<{
  active: boolean
  direction: 'asc' | 'desc'
  onClick: () => void
  children: React.ReactNode
}> = ({ active, direction, onClick, children }) => {
  return (
    <TableSortLabel
      active={active}
      direction={direction}
      onClick={onClick}
      IconComponent={ArrowDownwardIcon}
      sx={{
        '& .MuiTableSortLabel-icon': {
          color: 'grey !important',
        },
        '&:not(.Mui-active) .MuiTableSortLabel-icon': {
          display: 'none',
        },
      }}
    >
      {children}
    </TableSortLabel>
  )
}
