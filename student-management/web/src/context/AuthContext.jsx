import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { authService } from '../services/authService'
import { getAccessToken, saveTokens } from '../services/http'
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
  const [user, setUser] = useState(readStoredUser)
  const [status, setStatus] = useState(getAccessToken() ? 'loading' : 'anonymous')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const initialLoginDone = useRef(false)

  useEffect(() => {
    if (initialLoginDone.current) return
    initialLoginDone.current = true
    if (!getAccessToken()) return
    authService
      .me()
      .then((profile) => {
        if (!mounted.current) return
        setUser(profile)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile))
        setStatus('authenticated')
      })
      .catch(() => {
        if (!mounted.current) return
        setStatus('anonymous')
      })
  }, [])

  useEffect(() => {
    const onExpired = () => {
      saveTokens(null)
      localStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    saveTokens({ access: data.access, refresh: data.refresh })
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
    setUser(data.user)
    setStatus('authenticated')
    return data.user
  }, [])

  const logout = useCallback(async () => {
    let refresh = null
    try {
      refresh = JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || 'null')?.refresh
    } catch {
      refresh = null
    }
    if (refresh) await authService.logout(refresh)
    saveTokens(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
    setStatus('anonymous')
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
