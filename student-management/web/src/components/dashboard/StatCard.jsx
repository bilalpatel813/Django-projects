import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatNumber } from '../../utils/format'
import Skeleton from '../ui/Skeleton'

const TONES = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
}

export default function StatCard({ label, value, icon: Icon, tone = 'blue', delta, loading = false, hint }) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta)
  const direction = !hasDelta || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
  const DeltaIcon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus

  return (
    <div className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <span className={cn('flex size-10 items-center justify-center rounded-xl', TONES[tone] ?? TONES.blue)}>
            <Icon className="size-5" />
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatNumber(value)}</p>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-xs">
        {hasDelta && !loading ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium',
              direction === 'up' && 'bg-emerald-50 text-emerald-600',
              direction === 'down' && 'bg-red-50 text-red-600',
              direction === 'flat' && 'bg-slate-100 text-slate-500',
            )}
          >
            <DeltaIcon className="size-3" />
            {delta > 0 ? '+' : delta < 0 ? '-' : ''}{Math.abs(delta)}%
          </span>
        ) : null}
        {hint && !loading && <span className="text-slate-400">{hint}</span>}
      </div>
    </div>
  )
}
