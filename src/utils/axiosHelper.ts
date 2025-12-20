import { useAlertStore, useSpinnerStore, getAccessToken, useAuthStore } from '@stores'
import type { RequestConfig } from '@types'
import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001/api'
const BASE_URL_AUTH = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:7001/auth/api'
const APP_ID = import.meta.env.VITE_AUTHSVC_APPID || '0'
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'x-auth-appid': APP_ID,
}

export const extractAxiosErrorMessage = (error: AxiosError | unknown): string => {
  if (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response?.data?.responseMetadata?.responseStatusInfo?.errMsg) {
          return error.response?.data?.responseMetadata?.responseStatusInfo?.errMsg
        }

        const status = error.response.status
        switch (status) {
          case 401:
            return 'Unauthorized - Please login again'
          case 403:
            return 'Forbidden - You do not have permission'
          case 404:
            return 'Resource not found'
          case 500:
            return 'Server error - Please try again later'
          case 502:
            return 'Bad gateway - Service temporarily unavailable'
          case 503:
            return 'Service unavailable - Please try again later'
          case 504:
            return 'Gateway timeout - Service took too long to respond'
        }

        if (status >= 400 && status < 500) {
          return 'Client error - Please check your request'
        }

        if (status >= 500) {
          return 'Server error - Please try again later'
        }
      } else if (error.request) {
        return 'Network error - Please check your connection'
      }
    }
  }
  return 'An unexpected error occurred'
}

const createAxiosInstance = (baseUrl: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: COMMON_HEADERS,
    timeout: 15000,
  })

  instance.interceptors.request.use(
    (config) => {
      const requestConfig = config as RequestConfig
      config.headers = config.headers ?? {}
      if (config.withCredentials) {
        config.withCredentials = true
      }

      const noAuth = requestConfig.noAuth ?? false

      if (!noAuth) {
        const token = getAccessToken()
        if (token) {
          ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
        }
      }

      const showSpinner = requestConfig.showSpinner ?? true
      if (showSpinner) {
        useSpinnerStore.getState().showSpinner()
      }

      return config
    },
    (error) => {
      useSpinnerStore.getState().hideSpinner()
      return Promise.reject(error)
    },
  )

  instance.interceptors.response.use(
    (response) => {
      useSpinnerStore.getState().hideSpinner()
      return response
    },
    async (error: AxiosError) => {
      useSpinnerStore.getState().hideSpinner()

      const responseStatus = error.response?.status || 0
      const requestUrl = error.config?.url || ''
      console.log(`Error RequestUrl: ${requestUrl}, Response: ${responseStatus}`)

      const originalRequest = error.config as RequestConfig
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }

      if (
        originalRequest._retryCount < 2 &&
        responseStatus &&
        requestUrl &&
        responseStatus === 401 &&
        !(requestUrl.endsWith('logout') || requestUrl.endsWith('refresh'))
      ) {
        originalRequest._retryCount += 1
        console.log('Access token expired, attempting refresh...')
        const refreshSuccess = await useAuthStore.getState().refreshTokens()

        if (refreshSuccess) {
          const originalRequest = error.config as RequestConfig

          // Inject new token
          const newToken = getAccessToken()
          if (newToken) {
            ;(originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`
          }

          // Retry the original request
          return instance.request(originalRequest)
        }
      }

      return Promise.reject(error)
    },
  )

  return instance
}

const axiosInstanceCore = createAxiosInstance(BASE_URL)
const axiosInstanceAuth = createAxiosInstance(BASE_URL_AUTH)

class ApiHelper {
  private readonly axiosInstance: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.axiosInstance = instance
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const { ...axiosConfig } = config

    try {
      if (config.showSpinner) {
        useSpinnerStore.getState().showSpinner()
      }

      if (axiosConfig.url?.includes('{platformId}')) {
        axiosConfig.url = axiosConfig.url.replace('{platformId}', APP_ID)
      }

      const response: AxiosResponse<T> = await this.axiosInstance(axiosConfig)

      return response.data
    } catch (error) {
      const showError = config.showError !== false
      if (showError) {
        const { showAlert } = useAlertStore.getState()
        const errorMessage = extractAxiosErrorMessage(error)
        showAlert('error', errorMessage)
      }
      throw error
    } finally {
      useSpinnerStore.getState().hideSpinner()
    }
  }

  async get<T>(url: string, params?: Record<string, unknown>, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    })
  }

  async post<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    })
  }

  async put<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    })
  }

  async patch<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    })
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    })
  }

  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL
  }
}

export const apiHelperCore = new ApiHelper(axiosInstanceCore)
export const apiHelperAuth = new ApiHelper(axiosInstanceAuth)
