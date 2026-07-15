import axios from 'axios'
import { useCpWorkspaceStore } from '@/stores/cp-workspace.store'

const cpApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONNECT_API_URL,
  withCredentials: true,
  timeout: 15000,
})

cpApi.interceptors.request.use((config) => {
  const wsId = useCpWorkspaceStore.getState().workspaceId
  if (wsId) {
    config.headers['x-workspace-id'] = wsId
  }
  return config
})

cpApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 403) {
      // Toast handled at component level
    }
    return Promise.reject(
      new Error(err?.response?.data?.message || 'Request failed'),
    )
  },
)

export { cpApi }
