import { ArrowUpRight } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import { formatDate } from '../../utils/format'

export default function RecentStudentsTable({ students = [], loading, onViewAll }) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-44" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!students.length) {
    return <EmptyState title="No registrations yet" description="New students will appear here." />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 font-medium">Student</th>
            <th className="px-5 py-3 font-medium">Course</th>
            <th className="px-5 py-3 font-medium">Enrolled</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr key={student.id} className="group transition-colors hover:bg-slate-50/70">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{student.name}</p>
                    <p className="truncate text-xs text-slate-500">{student.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <Badge tone="blue">{student.course || 'Unassigned'}</Badge>
              </td>
              <td className="px-5 py-3 text-slate-600">{formatDate(student.enrollment_date)}</td>
              <td className="px-5 py-3 text-right">
                <button
                  type="button"
                  onClick={onViewAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  View students <ArrowUpRight className="size-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
