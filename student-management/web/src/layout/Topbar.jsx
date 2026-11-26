import { useLocation } from 'react-router-dom'
import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NAV_ITEMS } from '../constants/navigation'
import Avatar from '../components/ui/Avatar'

function pageTitle(pathname) {
  const match = NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to))
  if (pathname === '/') return 'Dashboard'
  return match?.label ?? 'Dashboard'
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle(pathname)}</h1>
        <p className="hidden text-xs text-slate-500 sm:block">Welcome back, keep things on track today.</p>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search…"
            aria-label="Search"
            className="h-9 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 lg:w-64"
          />
        </div>
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>
        <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2">
          <Avatar name={user?.username || user?.email || 'User'} size="sm" />
          <div className="hidden leading-tight sm:block">
            <p className="max-w-[10rem] truncate text-sm font-medium text-slate-800">
              {user?.username || 'Admin'}
            </p>
            <p className="max-w-[10rem] truncate text-[11px] text-slate-500">{user?.email || ''}</p>
          </div>
          <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
        </div>
      </div>
    </header>
  )
}
