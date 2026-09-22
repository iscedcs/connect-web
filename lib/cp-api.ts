import axios from 'axios'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCsrfToken } from '@/lib/csrf-client'
import {
  isAuthEndpoint,
  isBrowser,
  redirectToSignIn,
  refreshSession,
} from '@/lib/client-session'

const cpApi = axios.create({
  baseURL: '',
  withCredentials: true,
  timeout: 15000,
})

cpApi.interceptors.request.use((config) => {
  const wsId = useCpWorkspaceStore.getState().workspaceId
  if (wsId) {
    config.headers['x-workspace-id'] = wsId
  }
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

cpApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err?.config as
      | (typeof err.config & { __isRetry?: boolean })
      | undefined

    // An expired access token shows up here as a 401 from the CP proxy
    // route. Refresh once and replay; these requests authenticate from the
    // cookie server-side, so the replay picks up the new token on its own.
    if (
      isBrowser() &&
      err?.response?.status === 401 &&
      config &&
      !config.__isRetry &&
      !isAuthEndpoint(config.url)
    ) {
      config.__isRetry = true
      if (await refreshSession()) {
        return cpApi.request(config)
      }
      redirectToSignIn()
    }

    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Request failed'

    return Promise.reject(new Error(message))
  },
)

export { cpApi }
