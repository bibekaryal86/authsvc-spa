import { Security, People, AdminPanelSettings, Computer, ArrowForward } from '@mui/icons-material'
import { Container, Typography, Box, Grid, Card, CardContent, Chip } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Home: React.FC = () => {
  const navigate = useNavigate()

  const managementCards = [
    {
      title: 'Platforms',
      icon: <Computer sx={{ fontSize: 40 }} />,
      description:
        'Manage application platforms and their configurations. Platforms define the different applications or systems within your ecosystem.',
      path: '/platforms',
      color: 'primary',
      count: 0,
    },
    {
      title: 'Profiles',
      icon: <People sx={{ fontSize: 40 }} />,
      description:
        'Configure user profiles and their associated settings. Profiles represent user types with specific access requirements.',
      path: '/profiles',
      color: 'secondary',
      count: 0,
    },
    {
      title: 'Roles',
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      description: 'Define and manage user roles. Roles determine what actions users can perform within each platform.',
      path: '/roles',
      color: 'success',
      count: 0,
    },
    {
      title: 'Permissions',
      icon: <Security sx={{ fontSize: 40 }} />,
      description:
        'Set and manage access permissions. Permissions define specific actions that can be assigned to roles.',
      path: '/permissions',
      color: 'warning',
      count: 0,
    },
  ]

  const handleCardClick = (path: string) => {
    void navigate(path)
  }

  return (
    <Container maxWidth='lg' sx={{ py: 8, flex: 1 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' component='h1' gutterBottom fontWeight='bold'>
          Auth Service Dashboard
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          Manage your platform ecosystem, user profiles, roles, and permissions from a centralized interface.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {managementCards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => handleCardClick(card.path)}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      color: `${card.color}.main`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {card.icon}
                    <Typography variant='h5' component='h3' fontWeight='medium'>
                      {card.title}
                    </Typography>
                  </Box>
                  {card.count > 0 && (
                    <Chip
                      label={card.count}
                      color={card.color as 'primary' | 'secondary' | 'success' | 'warning'}
                      size='small'
                    />
                  )}
                </Box>

                <Typography variant='body2' color='text.secondary' paragraph sx={{ flexGrow: 1, mb: 2 }}>
                  {card.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography
                    variant='body2'
                    color={`${card.color}.main`}
                    sx={{
                      fontWeight: 'medium',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    <ArrowForward sx={{ fontSize: 16 }} />
                    Manage {card.title}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
