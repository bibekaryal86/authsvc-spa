import { authService, profileService } from '@services'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProfileEmailRequest, ProfilePasswordRequest, ProfileRequest, RequestMetadata } from '@types'

export const useReadProfiles = (params: RequestMetadata) =>
  useQuery({
    queryKey: ['profiles', params],
    queryFn: () => profileService.readProfiles(params),
    select: (data) => ({
      profiles: data.profiles,
    }),
    staleTime: 60_000,
  })

export const useReadProfileById = (id: number, params: RequestMetadata) =>
  useQuery({
    queryKey: ['profile', id, params],
    queryFn: () => profileService.readProfile(id, params),
    enabled: !!id,
    select: (data) => data.profiles[0] ?? null,
  })

export const useCreateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.createProfile,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProfileRequest> }) =>
      profileService.updateProfile(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['profile', id] })
    },
  })
}

export const useUpdateProfileEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProfileEmailRequest }) =>
      profileService.updateProfileEmail(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['profile', id] })
    },
  })
}
export const useUpdateProfilePassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProfilePasswordRequest }) =>
      profileService.updateProfilePassword(id, payload),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
      void queryClient.invalidateQueries({ queryKey: ['profile', id] })
    },
  })
}

export const useDeleteProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isHardDelete }: { id: number; isHardDelete: boolean }) =>
      profileService.deleteProfile(id, isHardDelete),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export const useRestoreProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => profileService.restoreProfile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
    },
  })
}

export const useInvalidateProfiles = (id?: number | null) => {
  const queryClient = useQueryClient()
  return () => {
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['profile', id] })
    } else {
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
    }
  }
}
