import axios from 'axios'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'
import { getCsrfToken } from '@/lib/csrf-client'

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
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Request failed'

    return Promise.reject(new Error(message))
  },
)

export { cpApi }
