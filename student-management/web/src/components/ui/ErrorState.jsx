import { AlertTriangle, RotateCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/60 px-6 py-10 text-center ${className}`}>
      <AlertTriangle className="mb-3 size-8 text-red-500" />
      <p className="text-sm font-medium text-slate-800">Could not load data</p>
      <p className="mt-1 max-w-sm text-xs text-slate-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          <RotateCw className="size-3.5" /> Try again
        </Button>
      )}
    </div>
  )
}
