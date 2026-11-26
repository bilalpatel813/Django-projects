import Skeleton from '../ui/Skeleton'
import { formatNumber } from '../../utils/format'

export default function GrowthChart({ data = [], loading, color = '#2563eb' }) {
  if (loading) {
    return <Skeleton className="h-52 w-full" />
  }

  const max = Math.max(1, ...data.map((d) => d.students))

  return (
    <div>
      <div className="flex items-end gap-2.5 sm:gap-4">
        {data.map((point, index) => {
          const height = Math.max(4, Math.round((point.students / max) * 100))
          const isLast = index === data.length - 1
          return (
            <div key={point.month + index} className="group flex flex-1 flex-col items-center gap-2">
              <span className={`text-[11px] font-medium ${point.students ? 'text-slate-600' : 'text-transparent'}`}>
                {formatNumber(point.students)}
              </span>
              <div className="relative flex h-48 w-full items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    backgroundColor: isLast ? color : '#bfdbfe',
                  }}
                  title={`${point.month}: ${point.students} students`}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500">{point.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
