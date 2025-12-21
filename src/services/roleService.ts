import { DEFAULT_PARAMS } from '@constants'
import type { RoleRequest, RoleResponse, RequestMetadata } from '@types'
import { apiHelperCore } from '@utils'
import { getRequestParams } from '@utils'

export const roleService = {
  createRole: async (roleRequest: RoleRequest): Promise<RoleResponse> => {
    return await apiHelperCore.post<RoleResponse>('/v1/roles/role', roleRequest)
  },

  readRoles: async (params: RequestMetadata = DEFAULT_PARAMS): Promise<RoleResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<RoleResponse>('/v1/roles', requestParams)
  },

  readRole: async (id: number, params: RequestMetadata = DEFAULT_PARAMS): Promise<RoleResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<RoleResponse>(`/v1/roles/role/${id}`, requestParams)
  },

  updateRole: async (id: number, role: Partial<RoleRequest>): Promise<RoleResponse> => {
    return await apiHelperCore.put<RoleResponse>(`/v1/roles/role/${id}`, role)
  },

  deleteRole: async (id: number, isHardDelete: boolean): Promise<RoleResponse> => {
    const url = isHardDelete ? `/v1/roles/role/${id}/hard` : `/v1/roles/role/${id}`
    return await apiHelperCore.delete(url)
  },

  restoreRole: async (id: number): Promise<RoleResponse> => {
    return await apiHelperCore.patch(`/v1/roles/role/${id}/restore`, { deletedDate: null })
  },
}
