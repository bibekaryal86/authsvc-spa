import { DEFAULT_PARAMS } from '@constants'
import type { PermissionRequest, PermissionResponse, RequestMetadata } from '@types'
import { apiHelperCore } from '@utils'
import { getRequestParams } from '@utils'

export const permissionService = {
  createPermission: async (permissionRequest: PermissionRequest): Promise<PermissionResponse> => {
    return await apiHelperCore.post<PermissionResponse>('/v1/permissions/permission', permissionRequest)
  },

  readPermissions: async (params: RequestMetadata = DEFAULT_PARAMS): Promise<PermissionResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<PermissionResponse>('/v1/permissions', requestParams)
  },

  readPermission: async (id: number, params: RequestMetadata = DEFAULT_PARAMS): Promise<PermissionResponse> => {
    const requestParams = getRequestParams(params)
    return await apiHelperCore.get<PermissionResponse>(`/v1/permissions/permission/${id}`, requestParams)
  },

  updatePermission: async (id: number, permission: Partial<PermissionRequest>): Promise<PermissionResponse> => {
    return await apiHelperCore.put<PermissionResponse>(`/v1/permissions/permission/${id}`, permission)
  },

  deletePermission: async (id: number, isHardDelete: boolean): Promise<PermissionResponse> => {
    const url = isHardDelete ? `/v1/permissions/permission/${id}/hard` : `/v1/permissions/permission/${id}`
    return await apiHelperCore.delete(url)
  },

  restorePermission: async (id: number): Promise<PermissionResponse> => {
    return await apiHelperCore.patch(`/v1/permissions/permission/${id}/restore`, { deletedDate: null })
  },
}
