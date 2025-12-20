import { routes } from '@routes'
import { useAuthStore } from '@stores'
import React from 'react'
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom'

export const Routes: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <RouterRoutes>
      {routes.map(({ path, component: Component, isProtected }) => {
        if (isProtected && !isAuthenticated) {
          // Redirect to login if trying to access protected route without auth
          return <Route key={path} path={path} element={<Navigate to='/' replace />} />
        }

        if (path === '/' && isAuthenticated) {
          // Redirect to home if trying to access login while authenticated
          return <Route key={path} path={path} element={<Navigate to='/home' replace />} />
        }

        return <Route key={path} path={path} element={<Component />} />
      })}
    </RouterRoutes>
  )
}
