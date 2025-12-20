import { THEME_MODES, COLORS } from '@constants'
import { Box, Typography, Paper } from '@mui/material'
import { useThemeStore } from '@stores'
import React from 'react'

export const Footer: React.FC = () => {
  const { mode } = useThemeStore()
  const currentYear = new Date().getFullYear()

  return (
    <Paper
      sx={{
        marginTop: 'auto',
        padding: 2,
        borderRadius: 0,
        backgroundColor: mode === THEME_MODES.LIGHT ? COLORS.BACKGROUND.LIGHT : COLORS.BACKGROUND.DARK,
      }}
      elevation={1}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
          &copy; {currentYear} Bibek Aryal
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
          Authentication and Authorization Service Admin Console
        </Typography>
      </Box>
    </Paper>
  )
}
