import { CalendarCheck, Info } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import Skeleton from '../ui/Skeleton'

export default function AttendanceOverview({ data = [], loading, available = false }) {
  const rate = available
    ? Math.round(
        (data.reduce((sum, d) => sum + d.present, 0) / Math.max(1, data.reduce((sum, d) => sum + d.total, 0))) * 100,
      )
    : null

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Attendance Overview"
        subtitle="Last 7 days"
        action={<CalendarCheck className="size-5 text-slate-300" />}
      />
      <CardBody className="flex flex-1 flex-col">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : !available ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
              <CalendarCheck className="size-5" />
            </span>
            <p className="text-sm font-medium text-slate-700">Attendance module not connected</p>
            <p className="max-w-xs text-xs text-slate-500">
              The backend does not have an attendance model yet. This panel will populate automatically once
              attendance tracking ships.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700">
              <Info className="size-3" /> Awaiting backend data
            </span>
          </div>
        ) : (
          <div>
            <p className="text-3xl font-semibold text-slate-900">{rate}%</p>
            <p className="text-xs text-slate-500">average attendance rate</p>
            <div className="mt-5 flex h-28 items-end gap-2">
              {data.map((day) => {
                const pct = day.total ? Math.round((day.present / day.total) * 100) : 0
                return (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end rounded bg-slate-100">
                      <div className="w-full rounded bg-brand-500 transition-all" style={{ height: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500">{day.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
