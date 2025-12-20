import { Lock, LockReset } from '@mui/icons-material'
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { authService } from '@services'
import { useAlertStore, useAuthStore } from '@stores'
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface LoginForm {
  email: string
  password: string
}

interface ResetForm {
  email: string
  newPassword: string
  confirmPassword: string
}

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { showAlert } = useAlertStore()
  const { login } = useAuthStore()

  const [mode, setMode] = useState<'login' | 'reset_init' | 'reset_exit'>('login')

  const [loginFormData, setLoginFormData] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [resetFormData, setResetFormData] = useState<ResetForm>({
    email: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)
  const [showValidationMessage, setShowValidationMessage] = useState('')
  const [showResetMessage, setShowResetMessage] = useState('')

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const isValidated = searchParams.get('is_validated')
    const isReset = searchParams.get('is_reset')

    if (isValidated === 'true') {
      setShowValidationMessage('true')
    } else if (isValidated === 'false') {
      setShowValidationMessage('false')
    } else if (isReset === 'true') {
      setMode('reset_exit')
      setShowResetMessage('true')
    } else if (isReset === 'false') {
      setMode('reset_exit')
      setShowResetMessage('false')
    }
  }, [location.search, showAlert])

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setResetFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const submitAsync = async () => {
      try {
        const response = await authService.login(loginFormData.email, loginFormData.password)
        login(response)
        showAlert('success', 'Login successful!')
        await navigate('/home')
        // } catch (error) {
        // console.error(error)
      } finally {
        setLoading(false)
      }
    }

    void submitAsync()
  }

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'reset_exit') {
      if (resetFormData.newPassword !== resetFormData.confirmPassword) {
        showAlert('error', 'Passwords do not match.')
        return
      }

      if (resetFormData.newPassword.length < 8) {
        showAlert('error', 'Password must be at least 8 characters long.')
        return
      }
    }

    setLoading(true)

    const submitAsync = async () => {
      try {
        if (mode === 'reset_init') {
          await authService.resetProfileInit(resetFormData.email)
          showAlert('success', 'Password reset initiated! Please check your email for further instructions.')
        } else if (mode === 'reset_exit') {
          await authService.resetProfile({ email: resetFormData.email, password: resetFormData.newPassword })
          showAlert('success', 'Password reset successful! Please login with your new password.')
        }

        setResetFormData({
          email: '',
          newPassword: '',
          confirmPassword: '',
        })
        setMode('login')
      } finally {
        setLoading(false)
      }
    }

    void submitAsync()
  }

  const handleSwitchToLogin = () => {
    setShowValidationMessage('')
    setShowResetMessage('')
    setMode('login')
  }

  const handleSwitchToReset = () => {
    setMode('reset_init')
  }

  return (
    <Container
      component='main'
      maxWidth='sm'
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
          }}
        >
          {mode === 'login' ? (
            <Lock sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          ) : (
            <LockReset sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
          )}
          <Typography component='h1' variant='h4' fontWeight='bold'>
            {mode === 'login' ? 'Sign In' : 'Reset Password'}
          </Typography>
        </Box>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          {mode === 'login'
            ? 'Welcome to Auth Service'
            : mode === 'reset_init'
              ? 'Enter your email to reset'
              : 'Enter your email and new password'}
        </Typography>

        {showValidationMessage && (
          <Alert
            severity={showValidationMessage === 'true' ? 'success' : 'error'}
            sx={{
              width: '100%',
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            onClose={() => setShowValidationMessage('')}
          >
            <Typography variant='body1' fontWeight='medium'>
              {showValidationMessage === 'true' ? 'Profile Validated Successfully!' : 'Profile could not be validated!'}
            </Typography>
            <Typography variant='body2'>
              {showValidationMessage === 'true'
                ? 'Your account has been verified. Please login to continue using the application'
                : 'Your account could not be verified. Please try again.'}
            </Typography>
          </Alert>
        )}
        {showResetMessage && (
          <Alert
            severity={showResetMessage === 'true' ? 'success' : 'error'}
            sx={{
              width: '100%',
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
            onClose={() => setShowResetMessage('')}
          >
            <Typography variant='body1' fontWeight='medium'>
              {showResetMessage === 'true' ? 'Profile Reset Started Successfully!' : 'Profile could not be reset!'}
            </Typography>
            <Typography variant='body2'>
              {showResetMessage === 'true'
                ? 'Your account reset process has started. Please continue to reset your password'
                : 'Your account could not be reset. Please try again.'}
            </Typography>
          </Alert>
        )}

        {mode === 'login' ? (
          <Box component='form' onSubmit={handleLoginSubmit} sx={{ width: '100%' }}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='email'
              label='Username'
              name='email'
              autoComplete='email'
              placeholder='Your Email is your username'
              value={loginFormData.email}
              onChange={handleLoginChange}
              disabled={loading}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={loginFormData.password}
              onChange={handleLoginChange}
              disabled={loading}
            />
            <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled={loading} size='large'>
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button color='secondary' onClick={handleSwitchToReset} disabled={loading}>
                Need to reset your account?
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component='form' onSubmit={handleResetSubmit} sx={{ width: '100%' }}>
            <TextField
              margin='normal'
              required
              fullWidth
              id='resetEmail'
              label='Email'
              name='email'
              type='email'
              autoComplete='email'
              placeholder='Enter your email address'
              value={resetFormData.email}
              onChange={handleResetChange}
              disabled={loading}
            />
            {mode === 'reset_exit' && showResetMessage === 'true' && (
              <>
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  name='newPassword'
                  label='New Password'
                  type='password'
                  autoComplete='new-password'
                  value={resetFormData.newPassword}
                  onChange={handleResetChange}
                  disabled={loading}
                  helperText='Minimum 8 characters'
                />
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  name='confirmPassword'
                  label='Confirm New Password'
                  type='password'
                  autoComplete='new-password'
                  value={resetFormData.confirmPassword}
                  onChange={handleResetChange}
                  disabled={loading}
                />
              </>
            )}

            <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} disabled={loading} size='large'>
              {loading ? <CircularProgress size={24} /> : 'Reset Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button color='primary' onClick={handleSwitchToLogin} disabled={loading}>
                Back to Sign In
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
