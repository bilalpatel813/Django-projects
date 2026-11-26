import Skeleton from '../ui/Skeleton'
import { formatNumber } from '../../utils/format'

const COLORS = ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']

export default function DonutChart({ data = [], loading, unitLabel = 'students' }) {
  if (loading) {
    return (
      <div className="flex items-center gap-6">
        <Skeleton className="size-36 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.total, 0)
  if (!total) {
    return <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
  }

  const radius = 15.9155
  const circumference = 100
  const segments = data.reduce((acc, item, i) => {
    const percent = (item.total / total) * 100
    const offset = i === 0 ? 0 : acc[i - 1].offset + acc[i - 1].percent
    acc.push({ ...item, percent, offset, color: COLORS[i % COLORS.length] })
    return acc
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 @lg:flex-row">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90">
          <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
          {segments.map((segment) => (
            <circle
              key={segment.course}
              cx="21"
              cy="21"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="6"
              strokeDasharray={`${segment.percent} ${circumference - segment.percent}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-slate-900">{formatNumber(total)}</span>
          <span className="text-[11px] text-slate-500">{unitLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {segments.map((segment) => (
          <li key={segment.course} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="min-w-0 flex-1 truncate text-slate-600" title={segment.course}>{segment.course}</span>
            <span className="font-medium text-slate-800">{formatNumber(segment.total)}</span>
            <span className="hidden w-9 shrink-0 text-right text-xs text-slate-400 @lg:inline">{Math.round(segment.percent)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
