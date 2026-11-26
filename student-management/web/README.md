# Student Management System: Web Frontend

React and Vite frontend for the Django REST API in the parent directory. The
dashboard, student management and read-only profile use the existing API.

## Dependencies and installation

Use Node.js 20.19+ or 22.12+ and npm. Runtime dependencies are React, React DOM,
React Router, Axios and Lucide React. Vite, its React and Tailwind CSS plugins,
Tailwind CSS and Oxlint are development dependencies; exact resolved versions are
recorded in `package-lock.json`.

```bash
cd student-management/web
npm ci
cp .env.example .env   # optional; edit when changing defaults
npm run dev            # http://localhost:5173
```

Start the Django backend separately. The repository currently configures SQLite;
PostgreSQL is not configured and must be set up at deployment. A working
database and migrated backend are required for actual login and data operations.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | empty | Browser-visible API base. Empty uses `/api`. For a separately hosted Django API, use its root origin, e.g. `https://api.example.com`. |
| `VITE_PROXY_TARGET` | `http://127.0.0.1:8000` | Backend target for the Vite development proxy only. |

The Vite development proxy strips `/api` before forwarding to Django, whose
routes are mounted at the root. In production, either set `VITE_API_BASE_URL`
at build time to the deployed API root or configure a reverse proxy that strips
`/api` in the same way. A nonempty base is used as supplied except for trailing
slashes. Configure Django's `CORS_ALLOWED_ORIGINS` for the frontend origin if
the browser talks to a different origin. Configure your web server to serve
`index.html` for frontend routes such as `/profile` and `/students`.

Vite embeds `VITE_` values in the public browser bundle. Never put secrets,
credentials or private keys in these variables.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server and API proxy |
| `npm test` | Frontend regression tests |
| `npm run lint` | Oxlint checks |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Preview the built frontend; this does not provide the development API proxy |

For production, set the public API configuration before `npm run build`, then
deploy `dist/` to a static host with the API proxy and SPA fallback as needed.

## Backend integration

Paths below are Django root paths. When the frontend base is `/api`, requests
have that prefix until the proxy removes it. Capitalization and trailing slashes
matter.

| Purpose | Endpoint |
| --- | --- |
| Sign in | `POST /login` with username and password |
| Current account | `GET /Me` |
| Refresh JWT | `POST /token/refresh` |
| Sign out | `POST /logout` with the refresh token |
| Dashboard | `GET /dashboard/stats` |
| Student list/create | `GET`, `POST /students/` |
| Student detail/update/delete | `GET`, `PATCH`, `DELETE /students/<uuid>/` |

Authenticated requests use a bearer access token. Rotating refresh tokens are
maintained while the page is active; the frontend retries an unauthorized
request after refresh and signs out if authentication is rejected. A network
outage can prevent server-side logout or refresh. Sessions may require a new
login after inactivity, a lost rotation response, or a prolonged outage. The
backend currently sets refresh tokens to 30 minutes and access tokens to 60
minutes; review these lifetimes for deployment. Tokens are stored in local
storage and are accessible to injected JavaScript; use HTTPS, a strong content
security policy and an appropriate production authentication design.

The backend returns only account ID, username and email for the profile. It has
no profile-update, password-change or role API, so those actions and role-based
navigation are not presented as available. Client-side route protection is not
an authorization boundary; backend permissions are authoritative.

## Deployment and verification limitations

- **Authorization needs review before exposure.** Public registration is
  enabled, and any authenticated user can read and modify all student records
  and view dashboard aggregates. The backend does not enforce staff, role or
  ownership restrictions for these endpoints.
- **Production settings are not ready.** The backend has a hard-coded
  development secret, `DEBUG=True`, and localhost-only `ALLOWED_HOSTS`. Use a
  new private secret and production-safe configuration; do not reuse the
  checked-in development key. Review HTTPS, CORS, logging and Django's
  deployment checklist.
- **Database and migrations need verification.** PostgreSQL is not configured.
  The account and student migration directories lack `__init__.py`; prior
  verification with Django 5.2 found that normal migrations did not create
  their tables. Resolve the migration strategy and test against a fresh
  deployment database before creating users or serving traffic. No schema or
  migration changes are included in this frontend task.
- Live login, refresh, logout, profile and student CRUD cannot be verified
  end-to-end without a running backend and configured database. Test them,
  including token rotation and server-side permissions, in the deployment
  environment.
- Student search and course-name grouping load all student pages client-side;
  they may be slow on large datasets. Backend pagination has no explicit
  ordering, so pages can shift when records change.
- Course names are derived from students, not course management. Teacher,
  class, attendance, report and settings sections without backend support are
  unavailable. Dashboard staff counts are not a teacher directory; attendance
  and performance data are unavailable.
