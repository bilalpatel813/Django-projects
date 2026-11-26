import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authService } from '../services/authService'
import { endSession, getSessionGeneration, readTokens, saveTokens, startTokenMaintenance } from '../services/http'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../constants'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readTokens() ? readStoredUser() : null)
  const [status, setStatus] = useState(() => readTokens() ? 'loading' : 'anonymous')
  const operation = useRef(0)
  const loginAttempt = useRef(0)

  useEffect(() => {
    let active = true
    let retryTimer
    const stopMaintenance = startTokenMaintenance()

    const clearUser = () => {
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
      setStatus('anonymous')
    }

    const restore = (allowCached = true) => {
      clearTimeout(retryTimer)
      const id = ++operation.current
      const session = getSessionGeneration()
      if (!readTokens()) {
        clearUser()
        return
      }
      authService.me().then((profile) => {
        if (!active || operation.current !== id || getSessionGeneration() !== session) return
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
        setUser(profile)
        setStatus('authenticated')
      }).catch(() => {
        if (!active || operation.current !== id || getSessionGeneration() !== session) return
        if (!readTokens()) {
          clearUser()
          return
        }
        // A network/server failure is not evidence that the stored session is invalid.
        const cached = allowCached && readStoredUser()
        if (cached) {
          setUser(cached)
          setStatus('authenticated')
        }
        retryTimer = setTimeout(() => restore(allowCached), 30000)
      })
    }

    const onExpired = () => {
      operation.current += 1
      clearTimeout(retryTimer)
      clearUser()
    }
    const onStorage = (event) => {
      if (event.key === TOKEN_STORAGE_KEY || event.key === null) {
        setUser(null)
        setStatus('loading')
        restore(false)
      }
    }
    window.addEventListener('auth:expired', onExpired)
    window.addEventListener('storage', onStorage)
    restore()

    return () => {
      active = false
      clearTimeout(retryTimer)
      window.removeEventListener('auth:expired', onExpired)
      window.removeEventListener('storage', onStorage)
      stopMaintenance()
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const id = operation.current
    const attempt = ++loginAttempt.current
    const data = await authService.login(credentials)
    if (id !== operation.current || attempt !== loginAttempt.current) {
      throw new Error('Sign in was superseded by another session change.')
    }
    if (!data?.access || !data?.refresh || !data?.user) throw new Error('Invalid login response.')
    operation.current += 1
    saveTokens({ access: data.access, refresh: data.refresh })
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
    setUser(data.user)
    setStatus('authenticated')
    return data.user
  }, [])

  const logout = useCallback(async () => {
    operation.current += 1
    const session = endSession()
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setStatus('anonymous')
    await authService.logout(session)
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isBootstrapping: status === 'loading',
      login,
      logout,
    }),
    [user, status, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
