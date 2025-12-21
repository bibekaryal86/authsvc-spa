import { permissionService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PermissionRequest, RequestMetadata } from '@types'

export const useReadPermissions = (params: RequestMetadata) =>
  useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionService.readPermissions(params),
    select: (data) => ({
      permissions: data.permissions,
      platformNames: data.platformNames,
    }),
    staleTime: 60_000,
  })

export const useReadPermissionById = (id: number, params: RequestMetadata) =>
  useQuery({
    queryKey: ['permission', id, params],
    queryFn: () => permissionService.readPermission(id, params),
    enabled: !!id,
    select: (data) => data.permissions[0] ?? null,
  })

export const useCreatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: permissionService.createPermission,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export const useUpdatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PermissionRequest> }) =>
      permissionService.updatePermission(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
      void queryClient.invalidateQueries({ queryKey: ['permission', id] })
    },
  })
}

export const useDeletePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHardDelete }: { id: number; isHardDelete: boolean }) =>
      permissionService.deletePermission(id, isHardDelete),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export const useRestorePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => permissionService.restorePermission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    },
  })
}

export const useInvalidatePermissions = (id?: number | null) => {
  const queryClient = useQueryClient()
  return () => {
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['permission', id] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['permissions'] })
    }
  }
}
