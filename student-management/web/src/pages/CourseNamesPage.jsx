import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, Search } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { getErrorMessage } from '../services/http'
import { studentService } from '../services/studentService'
import { formatNumber } from '../utils/format'

export default function CourseNamesPage() {
  useDocumentTitle('Course names')
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState({ revision: -1, students: [], error: null })
  const loading = result.revision !== revision

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        let page = 1
        let next = true
        const students = []
        while (next) {
          const data = await studentService.list({ page, signal: controller.signal })
          students.push(...data.results)
          next = Boolean(data.next)
          page += 1
        }
        if (!controller.signal.aborted) setResult({ revision, students, error: null })
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ revision, students: [], error: getErrorMessage(error, 'Unable to load student records.') })
        }
      }
    }
    load()
    return () => controller.abort()
  }, [revision])

  const groups = new Map()
  for (const student of result.students) {
    const name = student.course?.trim()
    if (!name) continue
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(student)
  }
  const term = query.trim().toLowerCase()
  const names = [...groups.keys()]
    .filter((name) => name.toLowerCase().includes(term))
    .sort((a, b) => a.localeCompare(b))

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Course names</h2>
          <p className="mt-1 text-sm text-slate-500">
            Names recorded on student records, not separate course entities. Blank names are excluded.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search course names..."
            aria-label="Search course names"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-64"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100" aria-label="Loading course names" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={() => setRevision((value) => value + 1)} className="m-5" />
        ) : names.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={term ? 'No matching course names' : 'No course names recorded'}
            description={term ? 'Try a different search term or clear the search.' : 'No student records currently have a course name.'}
          />
        ) : (
          <>
            <p className="border-b border-slate-100 px-5 py-3 text-xs text-slate-500">
              {formatNumber(names.length)} {names.length === 1 ? 'name' : 'names'}{term ? ' matching your search' : ''}
            </p>
            <div className="divide-y divide-slate-100">
              {names.map((name) => (
                <details key={name} className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm hover:bg-slate-50/70 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 break-words font-medium text-slate-800">{name}</span>
                    <span className="shrink-0 text-xs text-slate-500">{formatNumber(groups.get(name).length)} {groups.get(name).length === 1 ? 'student' : 'students'}</span>
                    <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">Students with this recorded name</p>
                    <ul className="divide-y divide-slate-100">
                      {groups.get(name).map((student) => (
                        <li key={student.id} className="flex items-center gap-3 py-2">
                          <Avatar name={student.full_name} size="sm" />
                          <div className="min-w-0">
                            <p className="break-words text-sm font-medium text-slate-800">{student.full_name}</p>
                            <p className="break-all text-xs text-slate-500">{student.email}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
