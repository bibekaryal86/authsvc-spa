import type { RequestMetadata } from '@types'

export const INVALID_SESSION = 'Your session has expired. Please log in again.'
export const ACCESS_TOKEN_KEY = 'access_token'

export const DEFAULT_PARAMS: RequestMetadata = {
  isIncludeHistory: false,
  isIncludeDeleted: false,
  platformId: '',
  roleId: '',
  isForceFetch: false,
}

export const ACTION_TYPE = {
  NONE: '',
  CREATE: 'CREATE',
  READ: 'READ',
  READ_ONE: 'READ_ONE',
  UPDATE: 'UPDATE',
  UPDATE_EMAIL: 'UPDATE_EMAIL',
  UPDATE_PASSWORD: 'UPDATE_PASSWORD',
  DELETE: 'DELETE',
  RESTORE: 'RESTORE',
  ASSIGN: 'ASSIGN',
  UNASSIGN: 'UNASSIGN',
  VALIDATE: 'VALIDATE',
  RESET: 'RESET',
} as const

export type ModalAction =
  | typeof ACTION_TYPE.CREATE
  | typeof ACTION_TYPE.UPDATE
  | typeof ACTION_TYPE.DELETE
  | typeof ACTION_TYPE.RESTORE

export type ModalActionExtended =
  | ModalAction
  | typeof ACTION_TYPE.VALIDATE
  | typeof ACTION_TYPE.RESET
  | typeof ACTION_TYPE.UPDATE_EMAIL
  | typeof ACTION_TYPE.UPDATE_PASSWORD

export type PrpPprAction = typeof ACTION_TYPE.ASSIGN | typeof ACTION_TYPE.UNASSIGN

// Theme Constants
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES]

// Color Constants
export const COLORS = {
  PRIMARY: {
    LIGHT: '#1976d2',
    DARK: '#90caf9',
  },
  SECONDARY: {
    LIGHT: '#dc004e',
    DARK: '#f48fb1',
  },
  BACKGROUND: {
    LIGHT: '#ffffff',
    DARK: '#121212',
    PAPER_LIGHT: '#ffffff',
    PAPER_DARK: '#1e1e1e',
  },
  APP_BAR: {
    LIGHT: '#1976d2',
    DARK: '#0d47a1',
  },
  ACCENT: {
    YELLOW: '#ffeb3b',
  },
} as const

// Storage Constants
export const STORAGE_KEYS = {
  THEME: 'theme-storage',
} as const

// Animation Constants
export const ANIMATION = {
  DURATION: {
    SHORT: '0.3s',
    MEDIUM: '0.5s',
    LONG: '1s',
  },
} as const

// Z-Index Constants
export const Z_INDEX = {
  SPINNER: 5555,
} as const
