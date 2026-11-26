import { useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, School, TrendingUp, Users } from 'lucide-react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Card, CardBody, CardHeader, ErrorState } from '../components/ui'
import StatCard from '../components/dashboard/StatCard'
import GrowthChart from '../components/dashboard/GrowthChart'
import DonutChart from '../components/dashboard/DonutChart'
import RecentStudentsTable from '../components/dashboard/RecentStudentsTable'
import AttendanceOverview from '../components/dashboard/AttendanceOverview'
import PerformanceOverview from '../components/dashboard/PerformanceOverview'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import PageHeader from '../components/dashboard/PageHeader'

function weeklyDelta(stats) {
  if (!stats) return undefined
  const { students_this_week: now, students_previous_week: prev } = stats
  if (!prev) return now ? 100 : 0
  return Math.round(((now - prev) / prev) * 100)
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const navigate = useNavigate()
  const { data, loading, error, reload, lastUpdated } = useDashboardStats()

  const stats = data?.stats
  const meta = data?.meta
  const attendanceAvailable = data?.meta?.attendance_source === 'database'
  const performanceAvailable = data?.meta?.performance_source === 'database'

  if (error && !data) {
    return (
      <>
        <PageHeader title="Dashboard" description="Overview of your institution." onRefresh={reload} />
        <ErrorState message={error} onRetry={reload} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A real-time overview of students, courses and activity."
        onRefresh={reload}
        refreshing={loading}
        lastUpdated={lastUpdated}
      />

      {error && data && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          Showing the last loaded data — refresh failed: {error}
        </div>
      )}

      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={stats?.total_students}
          icon={GraduationCap}
          tone="blue"
          delta={weeklyDelta(stats)}
          hint="vs last week"
          loading={loading}
        />
        <StatCard
          label="Total Teachers"
          value={stats?.total_teachers}
          icon={Users}
          tone="green"
          hint="active staff accounts"
          loading={loading}
        />
        <StatCard
          label="Total Courses"
          value={stats?.total_courses}
          icon={BookOpen}
          tone="violet"
          hint="unique courses"
          loading={loading}
        />
        <StatCard
          label="Total Classes"
          value={stats?.total_classes}
          icon={School}
          tone="amber"
          hint="course groupings"
          loading={loading}
        />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="New Student Registrations"
            subtitle="Enrollments over the last six months"
            action={
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <TrendingUp className="size-3.5" />
                {stats?.students_added_today ?? 0} today
              </span>
            }
          />
          <CardBody>
            <GrowthChart data={data?.growth ?? []} loading={loading} />
          </CardBody>
        </Card>

        <Card className="@container">
          <CardHeader title="Course Distribution" subtitle="Top courses by enrollment" />
          <CardBody>
            <DonutChart data={data?.course_distribution ?? []} loading={loading} />
          </CardBody>
        </Card>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent Student Registrations"
            subtitle="The five most recent enrollments"
            action={
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                View all
              </button>
            }
          />
          <RecentStudentsTable
            students={data?.recent_students ?? []}
            loading={loading}
            onViewAll={() => navigate('/students')}
          />
        </Card>

        <AttendanceOverview data={data?.attendance ?? []} loading={loading} available={attendanceAvailable} />
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PerformanceOverview
            data={data?.performance ?? []}
            loading={loading}
            available={performanceAvailable}
          />
        </div>
        <ActivityFeed activities={data?.activities ?? []} loading={loading} />
      </section>

      {meta?.attendance_source === 'unavailable' && (
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Attendance and performance panels are placeholders until those modules are added to the backend.
        </p>
      )}
    </>
  )
}
