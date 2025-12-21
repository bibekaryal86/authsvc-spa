import { platformService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PlatformRequest, RequestMetadata } from '@types'

export const useReadPlatforms = (params: RequestMetadata) =>
  useQuery({
    queryKey: ['platforms', params],
    queryFn: () => platformService.readPlatforms(params),
    select: (data) => ({
      platforms: data.platforms,
    }),
    staleTime: 60_000,
  })

export const useReadPlatformById = (id: number, params: RequestMetadata) =>
  useQuery({
    queryKey: ['platform', id, params],
    queryFn: () => platformService.readPlatform(id, params),
    enabled: !!id,
    select: (data) => data.platforms[0] ?? null,
  })

export const useCreatePlatform = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: platformService.createPlatform,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
    },
  })
}

export const useUpdatePlatform = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PlatformRequest> }) =>
      platformService.updatePlatform(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
      void queryClient.invalidateQueries({ queryKey: ['platform', id] })
    },
  })
}

export const useDeletePlatform = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHardDelete }: { id: number; isHardDelete: boolean }) =>
      platformService.deletePlatform(id, isHardDelete),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
    },
  })
}

export const useRestorePlatform = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformService.restorePlatform(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
    },
  })
}

export const useInvalidatePlatforms = (id?: number | null) => {
  const queryClient = useQueryClient()
  return () => {
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['platform', id] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['platforms'] })
    }
  }
}
