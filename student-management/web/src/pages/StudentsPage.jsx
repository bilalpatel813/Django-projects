import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, GraduationCap, Search } from 'lucide-react'
import { useStudents } from '../hooks/useStudents'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Skeleton from '../components/ui/Skeleton'
import { formatDate, formatNumber } from '../utils/format'
import { STUDENTS_PAGE_SIZE } from '../constants'

const GENDER_TONE = { Male: 'blue', Female: 'amber', Other: 'slate' }

export default function StudentsPage() {
  useDocumentTitle('Students')
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const { data, loading, error, reload } = useStudents({ page })

  const totalPages = Math.max(1, Math.ceil(data.count / STUDENTS_PAGE_SIZE))

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.results
    return data.results.filter((s) =>
      [s.full_name, s.email, s.course].filter(Boolean).some((v) => v.toLowerCase().includes(q)),
    )
  }, [data.results, query])

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Students</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatNumber(data.count)} students enrolled
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter this page…"
            aria-label="Filter students on this page"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 sm:w-64"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {error ? (
          <ErrorState message={error} onRetry={reload} className="m-5" />
        ) : loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={query ? 'No matches on this page' : 'No students enrolled yet'}
            description={query ? 'Try a different search term or clear the filter.' : 'Add students via the API or Django admin.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Gender</th>
                  <th className="px-5 py-3 font-medium">Age</th>
                  <th className="px-5 py-3 font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((student) => (
                  <tr key={student.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{student.full_name}</p>
                          <p className="truncate text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="blue">{student.course || 'Unassigned'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={GENDER_TONE[student.gender] ?? 'slate'}>{student.gender}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{student.age}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(student.enrollment_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && data.count > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Page {data.page ?? page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={!data.previous} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="size-3.5" /> Prev
              </Button>
              <Button variant="secondary" size="sm" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
