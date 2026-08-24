import { getAuthInfo } from '@/actions/auth'
import { BASE_URLS, URLS } from '../const'

export interface AuthUser {
  id: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  userType?: 'BUSINESS_USER' | 'INDIVIDUAL' | 'REGULAR' | string
  isVerified?: boolean
  profilePhoto?: string
  createdAt?: string
  [key: string]: any
}

/**
 * Fetch detailed user object from Auth API using URLS.user.one (/user/one/{id})
 */
export async function fetchAuthUser(userId?: string): Promise<AuthUser | null> {
  const auth = await getAuthInfo()
  if ('error' in auth || auth.isExpired) return null

  const targetId = userId || auth.user.id
  if (!targetId) return null

  const base = BASE_URLS.AUTH_API
  if (!base) return null

  try {
    const endpoint = URLS.user.one.replace('{id}', targetId)
    const url = `${base}${endpoint}`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (res.ok) {
      const data = await res.json()
      return data?.user || data?.data || data
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[fetchAuthUser] Failed to fetch user from Auth API:', error)
    }
  }

  return null
}
