import { type ThemeMode, THEME_MODES, COLORS } from '@constants'
import { createTheme, type ThemeOptions } from '@mui/material/styles'

const getThemeConfig = (mode: ThemeMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === THEME_MODES.LIGHT ? COLORS.PRIMARY.LIGHT : COLORS.PRIMARY.DARK,
    },
    secondary: {
      main: mode === THEME_MODES.LIGHT ? COLORS.SECONDARY.LIGHT : COLORS.SECONDARY.DARK,
    },
    background: {
      default: mode === THEME_MODES.LIGHT ? COLORS.BACKGROUND.LIGHT : COLORS.BACKGROUND.DARK,
      paper: mode === THEME_MODES.LIGHT ? COLORS.BACKGROUND.PAPER_LIGHT : COLORS.BACKGROUND.PAPER_DARK,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === THEME_MODES.LIGHT ? COLORS.APP_BAR.LIGHT : COLORS.APP_BAR.DARK,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
})

export const createAppTheme = (mode: ThemeMode) => {
  return createTheme(getThemeConfig(mode))
}
