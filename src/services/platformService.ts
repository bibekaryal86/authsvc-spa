import { DEFAULT_PARAMS } from '@constants'
import type { PlatformRequest, PlatformResponse, RequestMetadata } from '@types'
import { apiHelperCore } from '@utils'
import { getRequestParams } from '@utils'

export const platformService = {
  createPlatform: async (platformRequest: PlatformRequest): Promise<PlatformResponse> => {
    return await apiHelperCore.post<PlatformResponse>('/v1/platforms/platform', platformRequest)
  },

  readPlatforms: async (params: RequestMetadata = DEFAULT_PARAMS): Promise<PlatformResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<PlatformResponse>('/v1/platforms', requestParams)
  },

  readPlatform: async (id: number, params: RequestMetadata = DEFAULT_PARAMS): Promise<PlatformResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<PlatformResponse>(`/v1/platforms/platform/${id}`, requestParams)
  },

  updatePlatform: async (id: number, platform: Partial<PlatformRequest>): Promise<PlatformResponse> => {
    return await apiHelperCore.put<PlatformResponse>(`/v1/platforms/platform/${id}`, platform)
  },

  deletePlatform: async (id: number, isHardDelete: boolean): Promise<PlatformResponse> => {
    const url = isHardDelete ? `/v1/platforms/platform/${id}/hard` : `/v1/platforms/platform/${id}`
    return await apiHelperCore.delete(url)
  },

  restorePlatform: async (id: number): Promise<PlatformResponse> => {
    return await apiHelperCore.patch(`/v1/platforms/platform/${id}/restore`, { deletedDate: null })
  },
}
