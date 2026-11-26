import { useCallback, useEffect, useState } from 'react'
import { studentService } from '../services/studentService'
import { getErrorMessage } from '../services/http'
import { STUDENTS_PAGE_SIZE } from '../constants'

export function useStudents({ page, query }) {
  const [data, setData] = useState({ count: 0, results: [], next: null, previous: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const term = query.trim().toLowerCase()
        if (!term) {
          const result = await studentService.list({ page, signal: controller.signal })
          if (!controller.signal.aborted) setData(result)
        } else {
          // DRF exposes no search parameter. Walk its existing pages for an accurate search.
          let current = 1
          let next = true
          const matches = []
          while (next) {
            const result = await studentService.list({ page: current, signal: controller.signal })
            matches.push(...result.results.filter((student) =>
              [student.first_name, student.last_name, student.full_name, student.email, student.course]
                .some((value) => value?.toLowerCase().includes(term)),
            ))
            next = Boolean(result.next)
            current += 1
          }
          if (!controller.signal.aborted) {
            setData({
              count: matches.length,
              results: matches.slice((page - 1) * STUDENTS_PAGE_SIZE, page * STUDENTS_PAGE_SIZE),
              previous: page > 1,
              next: page * STUDENTS_PAGE_SIZE < matches.length,
            })
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(getErrorMessage(err, 'Unable to load students.'))
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, query.trim() ? 300 : 0)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [page, query, revision])

  const reload = useCallback(() => setRevision((value) => value + 1), [])
  return { data, loading, error, reload }
}
