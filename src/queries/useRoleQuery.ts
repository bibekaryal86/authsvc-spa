import { roleService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RoleRequest, RequestMetadata } from '@types'

export const useReadRoles = (params: RequestMetadata) =>
  useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleService.readRoles(params),
    select: (data) => ({
      roles: data.roles,
    }),
    staleTime: 60_000,
  })

export const useReadRoleById = (id: number, params: RequestMetadata) =>
  useQuery({
    queryKey: ['role', id, params],
    queryFn: () => roleService.readRole(id, params),
    enabled: !!id,
    select: (data) => data.roles[0] ?? null,
  })

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roleService.createRole,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RoleRequest> }) => roleService.updateRole(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      void queryClient.invalidateQueries({ queryKey: ['role', id] })
    },
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHardDelete }: { id: number; isHardDelete: boolean }) =>
      roleService.deleteRole(id, isHardDelete),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useRestoreRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => roleService.restoreRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })
}

export const useInvalidateRoles = (id?: number | null) => {
  const queryClient = useQueryClient()
  return () => {
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['role', id] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  }
}
