import axios from 'axios'
import { API_BASE_URL } from '../utils/env'
import { TOKEN_STORAGE_KEY } from '../constants'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

function readTokens() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveTokens(tokens) {
  if (tokens) localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function getAccessToken() {
  return readTokens()?.access ?? null
}

http.interceptors.request.use((config) => {
  const access = getAccessToken()
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  const tokens = readTokens()
  if (!tokens?.refresh) throw new Error('No refresh token available')

  const { data } = await axios.post(
    `${API_BASE_URL}/token/refresh`,
    { refresh: tokens.refresh },
    { headers: { 'Content-Type': 'application/json' } },
  )
  const next = {
    access: data.access,
    refresh: data.refresh ?? tokens.refresh,
  }
  saveTokens(next)
  return next.access
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    const isRefreshCall = config?.url?.includes('/token/refresh')

    if (response?.status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const access = await refreshPromise
        config.headers.Authorization = `Bearer ${access}`
        return http(config)
      } catch {
        saveTokens(null)
        window.dispatchEvent(new CustomEvent('auth:expired'))
      } finally {
        refreshPromise = null
      }
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  if (data && typeof data === 'object') {
    const first = Object.values(data)[0]
    if (Array.isArray(first)) return first[0]
    if (typeof first === 'string') return first
  }
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Is the API running?'
  if (!error?.response) return 'Cannot reach the API. Is the Django server running?'
  return fallback
}

export default http
