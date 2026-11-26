import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useMediaQuery } from '../hooks/useMediaQuery'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const { pathname } = useLocation()
  const [lastPath, setLastPath] = useState(pathname)

  if (pathname !== lastPath) {
    setLastPath(pathname)
    if (sidebarOpen) setSidebarOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = sidebarOpen && !isDesktop ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isDesktop])

  useEffect(() => {
    if (!sidebarOpen || isDesktop) return
    closeButtonRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        menuButtonRef.current?.focus()
      } else if (event.key === 'Tab') {
        const items = document.querySelectorAll('#main-navigation a[href], #main-navigation button:not([disabled])')
        const first = items[0]
        const last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen, isDesktop])

  function closeSidebar() {
    setSidebarOpen(false)
    if (!isDesktop) menuButtonRef.current?.focus()
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <a href="#main-content" className="sr-only z-[60] rounded-lg bg-white px-4 py-2 text-sm text-brand-700 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
      <Sidebar open={sidebarOpen} onClose={closeSidebar} isDesktop={isDesktop} closeButtonRef={closeButtonRef} />
      <div className="flex min-h-dvh flex-col lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} menuOpen={sidebarOpen && !isDesktop} menuButtonRef={menuButtonRef} />
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 px-4 py-4 text-xs text-slate-400 lg:px-8">
          Student Management System · Frontend v1
        </footer>
      </div>
    </div>
  )
}
