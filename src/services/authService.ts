import type {
  ProfilePasswordRequest,
  ProfilePasswordTokenResponse,
  ProfileRequest,
  ProfileResponse,
  ResponseWithMetadata,
} from '@types'
import { apiHelperAuth, apiHelperCore } from '@utils'

export const authService = {
  createProfile: async (profileRequest: ProfileRequest): Promise<ProfileResponse> => {
    return await apiHelperCore.post<ProfileResponse>(`/v1/auth/platform/{platformId}/create`, profileRequest, {
      noAuth: true,
    })
  },

  login: async (email: string, password: string): Promise<ProfilePasswordTokenResponse> => {
    return await apiHelperAuth.post<ProfilePasswordTokenResponse>(
      `/v1/cors/platform/{platformId}/login`,
      { email, password },
      {
        withCredentials: true,
        noAuth: true,
      },
    )
  },

  refreshToken: async (profileId: number, csrfToken: string): Promise<ProfilePasswordTokenResponse> => {
    return await apiHelperAuth.get<ProfilePasswordTokenResponse>(
      `/v1/cors/platform/{platformId}/profile/${profileId}/refresh`,
      undefined,
      {
        withCredentials: true,
        headers: {
          'x-auth-csrf': csrfToken,
        },
        noAuth: true,
      },
    )
  },

  logout: async (profileId: number): Promise<void> => {
    await apiHelperAuth.get(
      `/v1/cors/platform/{platformId}/profile/${profileId}/logout`,
      {},
      {
        noAuth: true,
      },
    )
  },

  validateProfileInit: async (email: string): Promise<ProfileResponse> => {
    return await apiHelperCore.get<ProfileResponse>(
      `/v1/ba_profiles/platform/{platformId}/validate_init`,
      { email },
      {
        noAuth: true,
      },
    )
  },

  resetProfileInit: async (email: string): Promise<ProfileResponse> => {
    return await apiHelperCore.get<ProfileResponse>(
      `/v1/ba_profiles/platform/{platformId}/reset_init`,
      { email },
      {
        noAuth: true,
      },
    )
  },

  resetProfile: async (profilePasswordRequest: ProfilePasswordRequest): Promise<ResponseWithMetadata> => {
    return await apiHelperCore.post<ResponseWithMetadata>(
      `/v1/ba_profiles/platform/{platformId}/reset`,
      profilePasswordRequest,
      {
        noAuth: true,
      },
    )
  },
}
