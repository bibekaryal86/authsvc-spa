import {
  Login,
  Home,
  Platforms,
  Profiles,
  Roles,
  Permissions,
  PermissionDetails,
  NotFound,
  RoleDetails,
  PlatformDetails,
  ProfileDetails,
} from '@pages'
import React from 'react'

interface RouteConfig {
  path: string
  component: React.ComponentType
  isProtected?: boolean
}

export const routes: RouteConfig[] = [
  { path: '/', component: Login },
  { path: '/home', component: Home, isProtected: true },
  { path: '/platforms', component: Platforms, isProtected: true },
  { path: '/platforms/:id', component: PlatformDetails, isProtected: true },
  { path: '/profiles', component: Profiles, isProtected: true },
  { path: '/profiles/:id', component: ProfileDetails, isProtected: true },
  { path: '/roles', component: Roles, isProtected: true },
  { path: '/roles/:id', component: RoleDetails, isProtected: true },
  { path: '/permissions', component: Permissions, isProtected: true },
  { path: '/permissions/:id', component: PermissionDetails, isProtected: true },
  { path: '*', component: NotFound },
]
