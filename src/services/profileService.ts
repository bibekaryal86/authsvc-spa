import { DEFAULT_PARAMS } from '@constants'
import type {
  ProfileEmailRequest,
  ProfilePasswordRequest,
  ProfileRequest,
  ProfileResponse,
  RequestMetadata,
} from '@types'
import { apiHelperCore } from '@utils'
import { getRequestParams } from '@utils'

export const profileService = {
  readProfiles: async (params: RequestMetadata = DEFAULT_PARAMS): Promise<ProfileResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<ProfileResponse>('/v1/profiles', requestParams)
  },

  readProfile: async (id: number, params: RequestMetadata = DEFAULT_PARAMS): Promise<ProfileResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<ProfileResponse>(`/v1/profiles/profile/${id}`, requestParams)
  },

  updateProfile: async (id: number, profile: Partial<ProfileRequest>): Promise<ProfileResponse> => {
    return await apiHelperCore.put<ProfileResponse>(`/v1/profiles/profile/${id}`, profile)
  },

  updateProfileEmail: async (id: number, profileEmailRequest: ProfileEmailRequest): Promise<ProfileResponse> => {
    return await apiHelperCore.put<ProfileResponse>(
      `/v1/profiles/platform/{platformId}/profile/${id}/email`,
      profileEmailRequest,
    )
  },

  updateProfilePassword: async (
    id: number,
    profilePasswordRequest: ProfilePasswordRequest,
  ): Promise<ProfileResponse> => {
    return await apiHelperCore.put<ProfileResponse>(
      `/v1/profiles/platform/{platformId}/profile/${id}/password`,
      profilePasswordRequest,
    )
  },

  deleteProfile: async (id: number, isHardDelete: boolean): Promise<ProfileResponse> => {
    const url = isHardDelete ? `/v1/profiles/profile/${id}/hard` : `/v1/profiles/profile/${id}`
    return await apiHelperCore.delete(url)
  },

  restoreProfile: async (id: number): Promise<ProfileResponse> => {
    return await apiHelperCore.patch(`/v1/profiles/profile/${id}/restore`, { deletedDate: null })
  },
}
