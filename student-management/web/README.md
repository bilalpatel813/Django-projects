# Student Management System — Web Frontend

React (Vite) admin frontend for the Django REST backend in `../`. It ships a login
screen and a fully API-driven dashboard.

## Stack

| Concern | Choice |
| --- | --- |
| Build tool | Vite |
| UI | React + JavaScript, Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router DOM (`createBrowserRouter`) |
| HTTP | Axios (JWT access + refresh interceptors) |
| Icons | Lucide React |

## Requirements

- Node.js 20.19+ (or 22.12+) and npm
- The Django backend running on `http://127.0.0.1:8000` (configurable)

## Setup

```bash
cd student-management/web
npm install
cp .env.example .env        # optional: only if you need to change the defaults
npm run dev                 # http://localhost:5173
```

## Environment variables

All API configuration lives in env vars — nothing is hardcoded.

| Variable | Used by | Default | Meaning |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | browser bundle | *(empty)* | API origin, e.g. `https://api.example.com`. Empty → use the dev proxy. A trailing `/api` is stripped automatically. |
| `VITE_PROXY_TARGET` | Vite dev server only | `http://127.0.0.1:8000` | Where `/api/*` requests are forwarded during `npm run dev`. |

- `.env.development` is committed with working defaults.
- `.env.production` must be given a real `VITE_API_BASE_URL` before `npm run build`.

## Backend setup

The backend already contains the dashboard endpoint the frontend consumes.
It was not bootable from a fresh clone, so the following fixes were applied
(no models or schema changes):

```bash
cd student-management
python -m venv .venv && source .venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt \
            django-cors-headers python-dotenv whitenoise

python manage.py migrate          # applies existing migrations
python manage.py createsuperuser  # the account you log in with
python manage.py runserver
```

If the SQLite database file is reachable, PostgreSQL can be configured later for
deployment without touching this frontend.

Allow the dev origin in CORS (defaults already cover it):

```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server with `/api` proxy → `VITE_PROXY_TARGET` |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint (ships with the Vite template) |

## Folder structure

```
web/
├── public/favicon.svg
├── index.html
├── vite.config.js          # React + Tailwind plugins, /api dev proxy
├── .env.example
└── src/
    ├── App.jsx             # Providers + router
    ├── main.jsx            # Entry point
    ├── index.css           # Tailwind import + brand theme tokens
    ├── assets/
    ├── components/
    │   ├── ui/             # Button, Card, Badge, Avatar, Skeleton, states
    │   ├── layout/         # reserved for layout-specific widgets
    │   ├── dashboard/      # StatCard, GrowthChart, DonutChart, tables, panels
    │   └── students/       # reserved for student feature components
    ├── constants/          # storage keys, nav items
    ├── context/            # AuthContext (JWT session), ToastContext
    ├── hooks/              # useDashboardStats, useStudents, useMediaQuery, …
    ├── layout/             # DashboardLayout, Sidebar, Topbar, Brand
    ├── pages/              # LoginPage, DashboardPage, StudentsPage, NotFoundPage
    ├── routes/             # router tree + ProtectedRoute guard
    ├── services/           # http (axios), authService, dashboardService, studentService
    └── utils/              # env, formatting, cn()
```

## API integration

| UI | Endpoint (relative to `VITE_API_BASE_URL`) | Notes |
| --- | --- | --- |
| Login | `POST /api/login` | Body `{ username, password }` → `{ user, access, refresh }` |
| Session restore | `GET /api/Me` | Bearer access token |
| Token refresh | `POST /api/token/refresh` | Automatic on 401 via interceptors |
| Logout | `POST /api/logout` | Blacklists the refresh token |
| Dashboard | `GET /api/dashboard/stats` | Aggregated stats returned by the dashboard endpoint below |
| Students list | `GET /api/students/?page=N` | Paginated (`count`, `next`, `previous`, `results`) |

### `GET /api/dashboard/stats` (new endpoint)

Authenticated (`IsAuthenticated`). Aggregates existing `Student` and `User`
models only — no new models, no changes to existing response shapes.

```json
{
  "stats": {
    "total_students": 24, "total_teachers": 2, "total_courses": 4, "total_classes": 4,
    "students_added_today": 1, "students_this_week": 5, "students_previous_week": 3
  },
  "growth": [{ "month": "Jun", "students": 0 }, "…"],
  "course_distribution": [{ "course": "Mathematics", "total": 6 }, "…"],
  "gender_breakdown": [{ "gender": "Male", "total": 9 }, "…"],
  "recent_students": [{ "id": "…", "name": "…", "email": "…", "course": "…", "enrollment_date": "…", "created_at": "…" }],
  "activities": [{ "id": "student-…", "type": "enrollment", "title": "… enrolled", "description": "…", "timestamp": "…" }],
  "attendance": [{ "day": "Mon", "present": 0, "absent": 0, "total": 0 }],
  "performance": [{ "label": "Excellent", "count": 0 }],
  "meta": {
    "attendance_source": "unavailable",
    "performance_source": "unavailable",
    "attendance_days": 7,
    "generated_at": "…"
  }
}
```

## Known limitations

- **Attendance and performance panels show an explicit "not connected" state.**
  The backend has no attendance, marks, exam or teacher-relationship model. The
  endpoint returns empty placeholders flagged `unavailable` in `meta`; the UI
  renders an honest empty state rather than inventing numbers. These panels
  light up automatically when `meta.*_source` becomes `database`.
- **Classes = distinct courses.** The schema has no class/section entity, so the
  "Total Classes" metric counts distinct non-empty `Student.course` values.
- **Teachers = staff users.** Counted from `User.objects.filter(is_staff=True)`.
- **Search filters the current page only** (the students API has no search parameter).
- Sidebar sections marked *Soon* (Teachers, Courses, Classes, Attendance,
  Reports, Settings) are placeholders for later phases.
