import { type AxiosRequestConfig } from 'axios'

// UTILS

export interface RequestConfig extends AxiosRequestConfig {
  showSpinner?: boolean
  showError?: boolean
  noAuth?: boolean
  withCredentials?: boolean
  _retryCount?: number
}

export interface RequestMetadata {
  isIncludeDeleted: boolean
  isIncludeHistory: boolean
  platformId: string
  roleId: string
  isForceFetch: boolean
}

export interface ResponseStatusInfo {
  errMsg: string | null
}

export interface ResponseCrudInfo {
  insertedRowsCount: number
  updatedRowsCount: number
  deletedRowsCount: number
  restoredRowsCount: number
}

export interface ResponsePageInfo {
  totalItems: number
  totalPages: number
  pageNumber: number
  perPage: number
}

export interface ResponseMetadata {
  responseStatusInfo: ResponseStatusInfo
  responseCrudInfo: ResponseCrudInfo
  responsePageInfo: ResponsePageInfo
}

export interface ResponseWithMetadata {
  responseMetadata: ResponseMetadata
}

// AUDITS

export interface AuditPermission {
  id: number
  eventType: string
  eventDesc: string
  createdAt: string
  createdBy: Profile
  ipAddress: string
  userAgent: string
  eventData: Permission
}

export interface AuditPlatform {
  id: number
  eventType: string
  eventDesc: string
  createdAt: string
  createdBy: Profile
  ipAddress: string
  userAgent: string
  eventData: Platform
}

export interface AuditProfile {
  id: number
  eventType: string
  eventDesc: string
  createdAt: string
  createdBy: Profile
  ipAddress: string
  userAgent: string
  eventData: Profile
}

export interface AuditRole {
  id: number
  eventType: string
  eventDesc: string
  createdAt: string
  createdBy: Profile
  ipAddress: string
  userAgent: string
  eventData: Role
}

// PERMISSIONS

export interface Permission {
  id: number
  createdDate: Date
  updatedDate: Date
  deletedDate: Date | null

  permissionName: string
  permissionDesc: string

  platformRolePermissions: PlatformRolePermission[] | []
  history: AuditPermission[] | []
}

export interface PermissionRequest {
  permissionName: string
  permissionDesc: string
}

export interface PermissionResponse {
  permissions: Permission[]
  responseMetadata: ResponseMetadata
  platformNames: string[] | []
}

// PLATFORMS

export interface Platform {
  id: number
  createdDate: Date
  updatedDate: Date
  deletedDate: Date | null

  platformName: string
  platformDesc: string

  platformProfileRoles: PlatformProfileRole[] | []
  platformRolePermissions: PlatformRolePermission[] | []
  history: AuditPlatform[] | []
}

export interface PlatformRequest {
  platformName: string
  platformDesc: string
}

export interface PlatformResponse {
  platforms: Platform[]
  responseMetadata: ResponseMetadata
}

// PROFILES

export interface ProfileAddress {
  id: number
  createdDate: Date
  updatedDate: Date
  deletedDate: Date | null

  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface ProfileAddressRequest {
  id: number | null
  profileId: number
  street: string
  city: string
  state: string
  country: string | null
  postalCode: string
}

export interface Profile {
  id: number
  createdDate: Date
  updatedDate: Date
  deletedDate: Date | null

  firstName: string
  lastName: string
  email: string
  phone: string | null
  isValidated: boolean
  loginAttempts: number
  lastLogin: Date | null

  profileAddress: ProfileAddress | null

  platformProfileRoles: PlatformProfileRole[] | []
  history: AuditProfile[] | []
}

export interface ProfileEmailRequest {
  oldEmail: string
  newEmail: string
}

export interface ProfilePasswordRequest {
  email: string
  password: string
}

export interface ProfilePasswordTokenResponse {
  accessToken: string | null
  authToken: AuthToken | null
  responseMetadata: ResponseMetadata

  // available only in non-prod envs
  refreshToken: string | null
  csrfToken: string | null
}

export interface ProfileRequest {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  password: string | null
  guestUser: boolean
  addressRequest: ProfileAddressRequest | null
}

export interface ProfileResponse {
  profiles: Profile[]
  responseMetadata: ResponseMetadata
  platformIds: number[] | []
  roleIds: number[] | []
}

// ROLES

export interface Role {
  id: number
  createdDate: Date
  updatedDate: Date
  deletedDate: Date | null

  roleName: string
  roleDesc: string

  platformProfileRoles: PlatformProfileRole[] | []
  platformRolePermissions: PlatformRolePermission[] | []
  history: AuditRole[] | []
}

export interface RoleRequest {
  roleName: string
  roleDesc: string
}

export interface RoleResponse {
  roles: Role[]
  responseMetadata: ResponseMetadata
}

// PPR

export interface PlatformProfileRole {
  platform: Platform
  profile: Profile
  role: Role
  assignedDate: Date
  unassignedDate: Date | null
}

export interface PlatformProfileRoleRequest {
  platformId: number
  profileId: number
  roleId: number
}

// PRP

export interface PlatformRolePermission {
  platform: Platform
  role: Role
  permission: Permission
  assignedDate: Date
  unassignedDate: Date | null
}

export interface PlatformRolePermissionRequest {
  platformId: number
  roleId: number
  permissionId: number
}

// Auth Token
export interface AuthToken {
  platform: AuthTokenPlatform
  profile: AuthTokenProfile
  roles: AuthTokenRole[]
  permissions: AuthTokenPermission[]
  isSuperUser: boolean
}

export interface AuthTokenPlatform {
  id: number
  platformName: string
}

export interface AuthTokenProfile {
  id: number
  email: string
}

export interface AuthTokenRole {
  id: number
  roleName: string
}

export interface AuthTokenPermission {
  id: number
  permissionName: string
}
