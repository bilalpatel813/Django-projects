import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  School,
  ClipboardCheck,
  BarChart3,
  Settings,
} from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: GraduationCap },
  { label: 'Teachers', to: '/teachers', icon: Users, disabled: true },
  { label: 'Courses', to: '/courses', icon: BookOpen, disabled: true },
  { label: 'Classes', to: '/classes', icon: School, disabled: true },
  { label: 'Attendance', to: '/attendance', icon: ClipboardCheck, disabled: true },
  { label: 'Reports', to: '/reports', icon: BarChart3, disabled: true },
  { label: 'Settings', to: '/settings', icon: Settings, disabled: true },
]
