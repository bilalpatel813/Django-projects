# PieBlogs V1

A full rebuild of PieBlogs: **Django + DRF** API backend and a **Next.js**
frontend, replacing the old server-rendered Django templates.

```
pieblogs_v1/
├── backend/     Django 5 + Django REST Framework API
├── frontend/    Next.js 14 (App Router) + Tailwind CSS
└── docs/
    └── ARCHITECTURE.md   ER diagram + architecture/workflow diagrams (Mermaid)
```

## What changed from V0

- **Frontend rebuilt in Next.js.** All Django templates (`login.html`,
  `create_credential.html`, `otp_varify.html`, `home.html`, `profile.html`, ...)
  are gone; the UI is now a set of Next.js App Router pages calling the DRF
  API over JSON.
- **Backend is DRF-only.** No more template `ListView`/`CreateView` mixed
  with partial APIs — every endpoint lives under `/api/...` and is built with
  DRF (`ModelViewSet`, `generics`, routers, `SimpleJWT`).
- **Email verification removed.** There is no more OTP step
  (`EmailOTP` model and the `verify-otp` / `resendotp` views are deleted).
  Instead, sign-up is restricted server-side to **`@gmail.com`** addresses
  (`ALLOWED_SIGNUP_EMAIL_DOMAINS` in `backend/config/settings.py`), and the
  account is active immediately — the sign-up API call returns JWT tokens
  directly.
- **New `SECRET_KEY`.** A freshly generated Django secret key ships in
  `backend/.env.example` — rotate it again before any real deployment.
- **`/landing` page.** A dedicated marketing/entry page a visitor sees first;
  the frontend's `/` route redirects to it.
- **ER diagram + architecture/workflow diagrams** are in `docs/ARCHITECTURE.md`.

## Feature parity checklist (V0 → V1)

| Feature | Status |
|---|---|
| Sign up / log in | ✅ (JWT, no OTP) |
| Profile (bio, avatar) | ✅ |
| Follow / unfollow | ✅ |
| Followers / following lists | ✅ |
| Blog CRUD (title, content, image) | ✅ |
| Post CRUD (image + caption) | ✅ |
| Following-based feed | ✅ |
| User search | ✅ |
| Post likes | ✅ (new in V1) |
| Landing page | ✅ (new in V1) |

## Running the backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # already has a freshly generated SECRET_KEY
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```
API is served at `http://127.0.0.1:8000`, admin at `/admin/`.

## Running the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points NEXT_PUBLIC_API_URL at the backend
npm run dev
```
App runs at `http://localhost:3000` — visiting `/` sends you to `/landing`.

## Key API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/accounts/register/` | Sign up (gmail-only, returns JWT) |
| POST | `/api/token/` | Log in (SimpleJWT) |
| POST | `/api/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/accounts/me/` | Current user's profile |
| GET | `/api/accounts/profile/<username>/` | Public profile |
| POST | `/api/accounts/follow/<username>/` | Follow / unfollow toggle |
| GET | `/api/accounts/profile/<username>/followers/` | Followers list |
| GET | `/api/accounts/profile/<username>/following/` | Following list |
| GET/POST | `/api/blog/blogs/` | List / create blogs |
| GET/PATCH/DELETE | `/api/blog/blogs/<id>/` | Blog detail / edit / delete |
| GET | `/api/blog/blogs/by-author/<username>/` | A user's blogs |
| GET/POST | `/api/blog/posts/` | List / create feed posts |
| POST | `/api/blog/posts/<id>/like/` | Like / unlike a post |
| GET | `/api/blog/feed/` | Posts from people you follow |
| GET | `/api/blog/search/users/?q=...` | Search users |

See `docs/ARCHITECTURE.md` for the full ER diagram and sequence diagrams.
