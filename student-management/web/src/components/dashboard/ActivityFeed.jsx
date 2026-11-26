import { UserPlus } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import { formatDateTime } from '../../utils/format'

export default function ActivityFeed({ activities = [], loading }) {
  return (
    <Card className="flex flex-col">
      <CardHeader title="Recent Activity" subtitle="Latest system events" />
      <CardBody className="flex-1">
        {loading ? (
          <ul className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </li>
            ))}
          </ul>
        ) : activities.length === 0 ? (
          <EmptyState icon={UserPlus} title="No activity yet" description="Events will show up here." />
        ) : (
          <ol className="relative space-y-4 border-l border-slate-100 pl-0">
            {activities.map((activity) => (
              <li key={activity.id} className="relative flex gap-3 pl-0">
                <span className="relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-4 ring-white">
                  <UserPlus className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="truncate text-sm font-medium text-slate-800">{activity.title}</p>
                  <p className="truncate text-xs text-slate-500">{activity.description}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTime(activity.timestamp)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}
