import { Header, Footer, Alert, Spinner, Routes } from '@components'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { query } from '@queries'
import { useThemeStore } from '@stores'
import { createAppTheme } from '@styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

const App: React.FC = () => {
  const { mode } = useThemeStore()
  const theme = React.useMemo(() => createAppTheme(mode), [mode])

  return (
    <QueryClientProvider client={query}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              height: '100vh',
              overflow: 'hidden',
              width: '100%',
              margin: 0,
              padding: 0,
            }}
          >
            <Header />
            <Alert />
            <Spinner />
            <main
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto',
                width: '100%',
                margin: 0,
              }}
            >
              <Routes />
            </main>
            <Footer />
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
