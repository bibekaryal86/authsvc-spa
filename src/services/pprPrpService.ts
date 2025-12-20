import type { PlatformProfileRoleRequest, PlatformRolePermissionRequest, ResponseWithMetadata } from '@types'
import { apiHelperCore } from '@utils'

export const pprService = {
  assignPpr: async (pprRequest: PlatformProfileRoleRequest): Promise<ResponseWithMetadata> => {
    return await apiHelperCore.post<ResponseWithMetadata>('/v1/ppr', pprRequest)
  },

  unassignPpr: async (pprRequest: PlatformProfileRoleRequest, isHardDelete: boolean): Promise<ResponseWithMetadata> => {
    let url = `/v1/ppr/platform/${pprRequest.platformId}/profile/${pprRequest.profileId}/role/${pprRequest.roleId}`
    if (isHardDelete) {
      url += '/hard'
    }
    return await apiHelperCore.delete(url)
  },
}

export const prpService = {
  assignPrp: async (prpRequest: PlatformRolePermissionRequest): Promise<ResponseWithMetadata> => {
    return await apiHelperCore.post<ResponseWithMetadata>('/v1/prp', prpRequest)
  },

  unassignPrp: async (
    prpRequest: PlatformRolePermissionRequest,
    isHardDelete: boolean,
  ): Promise<ResponseWithMetadata> => {
    let url = `/v1/prp/platform/${prpRequest.platformId}/role/${prpRequest.roleId}/permission/${prpRequest.permissionId}`
    if (isHardDelete) {
      url += '/hard'
    }
    return await apiHelperCore.delete(url)
  },
}
