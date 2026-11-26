import { GraduationCap } from 'lucide-react'
import { cn } from '../utils/cn'

export default function Brand({ compact = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-slate-900">EduAdmin</span>
          <span className="block text-[11px] font-medium text-slate-500">Student Management</span>
        </span>
      )}
    </div>
  )
}
