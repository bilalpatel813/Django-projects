import { useCallback, useEffect, useState } from 'react'
import { studentService } from '../services/studentService'
import { getErrorMessage } from '../services/http'
import { STUDENTS_PAGE_SIZE } from '../constants'

export function useStudents({ page = 1, query = '' } = {}) {
  const [result, setResult] = useState({ data: { count: 0, results: [], next: null, previous: null }, error: null, key: null })
  const [revision, setRevision] = useState(0)
  const key = JSON.stringify([page, query, revision])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const term = query.trim().toLowerCase()
        if (!term) {
          const result = await studentService.list({ page, signal: controller.signal })
          if (!controller.signal.aborted) setResult({ data: result, error: null, key })
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
            setResult({ data: {
              count: matches.length,
              results: matches.slice((page - 1) * STUDENTS_PAGE_SIZE, page * STUDENTS_PAGE_SIZE),
              previous: page > 1,
              next: page * STUDENTS_PAGE_SIZE < matches.length,
            }, error: null, key })
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) setResult((current) => ({ ...current, error: getErrorMessage(err, 'Unable to load students.'), key }))
      }
    }, query.trim() ? 300 : 0)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [page, query, key])

  const reload = useCallback(() => setRevision((value) => value + 1), [])
  return { data: result.data, loading: result.key !== key, error: result.key === key ? result.error : null, reload }
}
