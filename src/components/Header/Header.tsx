import { ANIMATION, COLORS, THEME_MODES } from '@constants'
import { Brightness4, Brightness7, Computer, People, AdminPanelSettings, Security, Logout } from '@mui/icons-material'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useThemeStore, useAlertStore, useAuthStore } from '@stores'
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleTheme } = useThemeStore()
  const { showAlert } = useAlertStore()
  const { isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    void (async () => {
      if (isAuthenticated) {
        await logout()
        showAlert('success', 'Logged out successfully!')
        await navigate('/')
      }
    })()
  }

  const navigationItems = [
    { path: '/platforms', label: 'Platforms', icon: <Computer sx={{ fontSize: 18 }} /> },
    { path: '/profiles', label: 'Profiles', icon: <People sx={{ fontSize: 18 }} /> },
    { path: '/roles', label: 'Roles', icon: <AdminPanelSettings sx={{ fontSize: 18 }} /> },
    { path: '/permissions', label: 'Permissions', icon: <Security sx={{ fontSize: 18 }} /> },
  ]

  return (
    <AppBar position='static' elevation={2}>
      <Toolbar>
        <Typography
          variant='h5'
          component={Link}
          to='/'
          fontWeight='bold'
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          Auth Service
        </Typography>

        {isAuthenticated && (
          <Stack direction='row' spacing={1} alignItems='center'>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color='inherit'
                component={Link}
                to={item.path}
                startIcon={item.icon}
                variant={location.pathname === item.path ? 'outlined' : 'text'}
                sx={{
                  borderColor: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}

            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              <Tooltip title={`Switch to ${mode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT} mode`}>
                <IconButton
                  onClick={toggleTheme}
                  color='inherit'
                  sx={{
                    ml: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(15deg)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {mode === THEME_MODES.LIGHT ? <Brightness4 /> : <Brightness7 />}
                </IconButton>
              </Tooltip>

              <FormControlLabel
                control={
                  <Switch
                    checked={mode === THEME_MODES.DARK}
                    onChange={toggleTheme}
                    color='default'
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: COLORS.ACCENT.YELLOW,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: COLORS.ACCENT.YELLOW,
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2' sx={{ color: 'inherit', ml: 1 }}>
                    {mode === THEME_MODES.LIGHT ? 'Light' : 'Dark'}
                  </Typography>
                }
                sx={{ ml: 1, color: 'inherit' }}
              />
              <Tooltip title='Logout'>
                <IconButton
                  onClick={handleLogout}
                  color='inherit'
                  sx={{
                    ml: 1,
                    transition: `all ${ANIMATION.DURATION.MEDIUM} ease`,
                    '&:hover': {
                      transform: 'scale(1.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}
