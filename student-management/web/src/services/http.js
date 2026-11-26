import axios from 'axios'
import { API_BASE_URL } from '../utils/env'
import { TOKEN_STORAGE_KEY } from '../constants'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

const tokenClient = axios.create({ baseURL: API_BASE_URL, timeout: 20000 })
let generation = 0
let refreshPromise = null
let maintenanceTimer = null
const logoutRotations = new Set()

export function readTokens() {
  try {
    const tokens = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || 'null')
    return tokens && typeof tokens.access === 'string' && typeof tokens.refresh === 'string'
      && tokens.access && tokens.refresh ? tokens : null
  } catch {
    return null
  }
}

export function saveTokens(tokens) {
  generation += 1
  if (tokens) {
    const sessionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({ ...tokens, sessionId }))
  }
  else localStorage.removeItem(TOKEN_STORAGE_KEY)
  scheduleMaintenance()
}

export function getAccessToken() {
  return readTokens()?.access ?? null
}

export function getSessionGeneration() {
  return generation
}

function sameSession(tokens, expected) {
  return tokens?.refresh === expected?.refresh && tokens?.access === expected?.access
    && tokens?.sessionId === expected?.sessionId
}

function expiredSession(expected, currentGeneration) {
  if (generation !== currentGeneration || !sameSession(readTokens(), expected)) return
  saveTokens(null)
  window.dispatchEvent(new CustomEvent('auth:expired'))
}

function isRejected(error) {
  return error?.response?.status === 401 || error?.response?.status === 400
}

async function performRefresh(expected, currentGeneration) {
  const run = async () => {
    const current = readTokens()
    if (generation !== currentGeneration || !current) throw new axios.CanceledError('Session changed')
    if (current.sessionId !== expected.sessionId) throw new axios.CanceledError('Session changed')
    if (!sameSession(current, expected)) return current
    try {
      const { data } = await tokenClient.post('/token/refresh', { refresh: current.refresh })
      if (typeof data?.access !== 'string' || typeof data?.refresh !== 'string' || !data.access || !data.refresh) {
        throw new Error('Invalid refresh response')
      }
      const next = { access: data.access, refresh: data.refresh, sessionId: current.sessionId }
      if (generation === currentGeneration && sameSession(readTokens(), current)) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(next))
        scheduleMaintenance()
      } else if (!logoutRotations.has(currentGeneration)) {
        // Another tab or a new login replaced the session while rotation was in flight.
        void revokeSession({ tokens: next, pending: null })
      }
      return next
    } catch (error) {
      if (isRejected(error)) expiredSession(current, currentGeneration)
      throw error
    }
  }
  // Rotation must be serialized across tabs as well as within this tab.
  return navigator.locks ? navigator.locks.request('sms.auth.refresh', run) : run()
}

function refreshTokens(expected, currentGeneration) {
  if (refreshPromise?.generation === currentGeneration) return refreshPromise.promise
  const entry = { generation: currentGeneration, promise: null }
  entry.promise = performRefresh(expected, currentGeneration).finally(() => {
    if (refreshPromise === entry) refreshPromise = null
  })
  refreshPromise = entry
  return entry.promise
}

function refreshExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const exp = JSON.parse(atob(payload)).exp
    return typeof exp === 'number' && Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}

function scheduleMaintenance(retry = false) {
  clearTimeout(maintenanceTimer)
  const tokens = readTokens()
  const expiry = tokens && refreshExpiry(tokens.refresh)
  if (!expiry || expiry <= Date.now()) return
  const delay = retry ? 30000 : Math.max(0, expiry - Date.now() - 60000)
  maintenanceTimer = setTimeout(async () => {
    const current = readTokens()
    const currentGeneration = generation
    if (!current || refreshExpiry(current.refresh) <= Date.now()) return
    try {
      await refreshTokens(current, currentGeneration)
    } catch {
      if (generation === currentGeneration && sameSession(readTokens(), current)) scheduleMaintenance(true)
    }
  }, delay)
}

export function startTokenMaintenance() {
  scheduleMaintenance()
  const onStorage = (event) => {
    if (event.key === TOKEN_STORAGE_KEY || event.key === null) {
      generation += 1
      scheduleMaintenance()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    clearTimeout(maintenanceTimer)
    window.removeEventListener('storage', onStorage)
  }
}

// Clear first so late responses cannot restore the session. The pending rotation,
// if any, supplies the refresh token that must be blacklisted instead of its predecessor.
export function endSession() {
  const tokens = readTokens()
  const pending = refreshPromise?.generation === generation ? refreshPromise.promise : null
  if (pending) {
    const pendingGeneration = generation
    logoutRotations.add(pendingGeneration)
    pending.then(() => logoutRotations.delete(pendingGeneration), () => logoutRotations.delete(pendingGeneration))
  }
  saveTokens(null)
  return { tokens, pending }
}

export async function revokeSession({ tokens, pending }) {
  try {
    if (pending) tokens = await pending.catch(() => tokens)
    if (!tokens) return
    const logout = (pair) => tokenClient.post('/logout', { refresh: pair.refresh }, {
      headers: { Authorization: `Bearer ${pair.access}` },
    })
    try {
      await logout(tokens)
    } catch (error) {
      if (error?.response?.status !== 401) throw error
      const { data } = await tokenClient.post('/token/refresh', { refresh: tokens.refresh })
      if (data?.access && data?.refresh) await logout(data)
    }
  } catch {
    // Local logout is immediate even when the server cannot be reached.
  }
}

http.interceptors.request.use((config) => {
  if (config.skipAuth) {
    delete config.headers.Authorization
    return config
  }
  const tokens = readTokens()
  if (config._retried && (config._authGeneration !== generation || config._sessionId !== tokens?.sessionId)) {
    throw new axios.CanceledError('Session changed')
  }
  const access = tokens?.access ?? null
  config._authGeneration = generation
  config._access = access
  config._sessionId = tokens?.sessionId
  if (access) config.headers.Authorization = `Bearer ${access}`
  else delete config.headers.Authorization
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    if (response?.status !== 401 || !config || config.skipAuth || !config._access) throw error
    const currentGeneration = config._authGeneration
    const tokens = readTokens()
    if (generation !== currentGeneration || !tokens || tokens.sessionId !== config._sessionId) throw error
    if (config._retried) {
      if (tokens.access === config._access) expiredSession(tokens, currentGeneration)
      throw error
    }
    config._retried = true
    const next = tokens.access !== config._access ? tokens : await refreshTokens(tokens, currentGeneration)
    if (generation !== currentGeneration || !sameSession(readTokens(), next)) {
      throw new axios.CanceledError('Session changed')
    }
    return http(config)
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
