import { Container, Paper, type PaperProps } from '@mui/material'
import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  paperProps?: PaperProps
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, maxWidth = 'lg', paperProps }) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 4,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ...paperProps?.sx,
        }}
        {...paperProps}
      >
        {children}
      </Paper>
    </Container>
  )
}
