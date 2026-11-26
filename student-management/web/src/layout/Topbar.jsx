import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NAV_ITEMS } from '../constants/navigation'
import Avatar from '../components/ui/Avatar'

function pageTitle(pathname) {
  const match = NAV_ITEMS.find((item) => item.to !== '/' && pathname.startsWith(item.to))
  if (pathname === '/') return 'Dashboard'
  return match?.label ?? 'Dashboard'
}

export default function Topbar({ onMenuClick, menuOpen, menuButtonRef }) {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:px-8">
      <button
        type="button"
        ref={menuButtonRef}
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-slate-900">{pageTitle(pathname)}</h1>
        <p className="hidden text-xs text-slate-500 sm:block">Welcome back, keep things on track today.</p>
      </div>

      <div className="ml-auto flex min-w-0 items-center">
        <Link to="/profile" aria-label="View profile" className="flex min-w-0 items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100">
          <Avatar name={user?.username || user?.email || 'User'} size="sm" />
          <div className="hidden leading-tight sm:block">
            <p className="max-w-[10rem] truncate text-sm font-medium text-slate-800">
              {user?.username || 'Account'}
            </p>
            <p className="max-w-[10rem] truncate text-[11px] text-slate-500">{user?.email || ''}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
