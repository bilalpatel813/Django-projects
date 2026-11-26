export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('en-US').format(Number(value))
}

export function formatDate(value, options) {
  if (!value) return '—'
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', options ?? { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function formatDateTime(value) {
  return formatDate(value, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function dashboardEndpointPath() {
  return '/dashboard/stats'
}

export function weeklyDelta(stats) {
  if (!stats) return undefined
  const { students_this_week: now, students_previous_week: prev } = stats
  if (prev === 0) return now ? undefined : 0
  return Math.round(((now - prev) / prev) * 100)
}
