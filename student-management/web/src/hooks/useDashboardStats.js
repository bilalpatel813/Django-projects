import { useCallback, useEffect, useRef, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import { getErrorMessage } from '../services/http'

export function useDashboardStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    try {
      const result = await dashboardService.getStats()
      if (id !== requestId.current) return
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      if (id !== requestId.current) return
      setError(getErrorMessage(err, 'Unable to load dashboard data.'))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sets the loading flag for the initial fetch
    load()
  }, [load])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    return load()
  }, [load])

  return { data, loading, error, lastUpdated, reload }
}
