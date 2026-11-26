import { BarChart3, Info } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import Skeleton from '../ui/Skeleton'

export default function PerformanceOverview({ data = [], loading, available = false }) {
  const total = data.reduce((sum, b) => sum + b.count, 0)
  const average = available && total
    ? Math.round(
        data.reduce((sum, b) => {
          const midpoint = { Excellent: 95, Good: 82, Average: 67, 'Needs Work': 50 }[b.label] ?? 0
          return sum + midpoint * b.count
        }, 0) / total,
      )
    : null

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Student Performance"
        subtitle="Grade distribution"
        action={<BarChart3 className="size-5 text-slate-300" />}
      />
      <CardBody className="flex flex-1 flex-col">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : !available ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
              <BarChart3 className="size-5" />
            </span>
            <p className="text-sm font-medium text-slate-700">Grades are not tracked yet</p>
            <p className="max-w-xs text-xs text-slate-500">
              There is no marks or exam model in the backend, so results cannot be shown without inventing data.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
              <Info className="size-3" /> Awaiting backend data
            </span>
          </div>
        ) : (
          <div>
            <p className="text-3xl font-semibold text-slate-900">{average}%</p>
            <p className="text-xs text-slate-500">weighted average score</p>
            <ul className="mt-5 space-y-3">
              {data.map((bucket) => {
                const pct = total ? Math.round((bucket.count / total) * 100) : 0
                return (
                  <li key={bucket.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium text-slate-600">{bucket.label}</span>
                      <span className="text-slate-500">{bucket.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
