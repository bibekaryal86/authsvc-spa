import { Home, ArrowBack } from '@mui/icons-material'
import { Container, Typography, Paper, Button, Box } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound: React.FC = () => {
  return (
    <Container maxWidth='md' sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Typography
          variant='h1'
          component='h1'
          fontWeight='bold'
          color='primary'
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            mb: 2,
          }}
        >
          404
        </Typography>

        <Typography variant='h4' component='h2' gutterBottom fontWeight='medium'>
          Page Not Found
        </Typography>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to familiar
          territory.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} to='/' variant='contained' size='large' startIcon={<Home />}>
            Go Home
          </Button>
          <Button variant='outlined' size='large' startIcon={<ArrowBack />} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
