import { RotateCw } from 'lucide-react'
import Button from '../ui/Button'

export default function PageHeader({ title, description, onRefresh, refreshing, lastUpdated }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-slate-400">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        {onRefresh && (
          <Button variant="secondary" size="sm" onClick={onRefresh} loading={refreshing}>
            <RotateCw className="size-3.5" /> Refresh
          </Button>
        )}
      </div>
    </div>
  )
}
