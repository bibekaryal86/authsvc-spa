import type { Profile, RequestMetadata } from '@types'

export const getNumber = (value: number | string | null | undefined): number =>
  value ? (isNaN(Number(value)) ? 0 : Number(value)) : 0

export const checkNumber = (value: number | string | null | undefined): boolean => getNumber(value) > 0

export const getString = (value: string | number | null | undefined): string => (value ? value.toString().trim() : '')

export const getRequestParams = (requestMetadata: RequestMetadata): Record<string, boolean | number | string> => {
  const requestParams: Record<string, string | boolean | number> = {}

  if (requestMetadata.isIncludeDeleted) {
    requestParams.isIncludeDeleted = true
  }
  if (requestMetadata.isIncludeHistory) {
    requestParams.isIncludeHistory = true
  }

  return requestParams
}

export const getUserFullName = (profile: Profile): string => {
  return profile ? `${profile.lastName}, ${profile.firstName}` : ''
}

export const getFormattedDate = (value: Date | null): string => {
  if (value === null) return '-'
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))
}
