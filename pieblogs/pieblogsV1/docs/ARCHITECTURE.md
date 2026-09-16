# PieBlogs V1 — ER Diagram & Architecture

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| PROFILE : "has"
    USER ||--o{ BLOG : "authors"
    USER ||--o{ POST : "creates"
    USER ||--o{ POSTLIKE : "likes"
    USER ||--o{ FOLLOW : "follows (as follower)"
    USER ||--o{ FOLLOW : "followed by (as following)"
    POST ||--o{ POSTLIKE : "receives"

    USER {
        int id PK
        string username
        string email
        string password_hash
        bool is_active
    }

    PROFILE {
        int id PK
        int user_id FK
        string bio
        image profilepic
    }

    FOLLOW {
        int id PK
        int followers_id FK "who follows"
        int followings_id FK "who is followed"
        datetime created_at
    }

    BLOG {
        int id PK
        string title
        text content
        image image
        int author_id FK
        datetime created_at
        datetime updated_at
    }

    POST {
        int id PK
        int user_id FK
        image image
        text caption
        datetime created_at
    }

    POSTLIKE {
        int id PK
        int post_id FK
        int user_id FK
        datetime created_at
    }
```

Notes:
- `USER` is Django's built-in `auth.User`.
- `PROFILE` is a strict 1-1 extension (auto-created via a `post_save` signal).
- `FOLLOW` is a self-referencing many-to-many on `USER`, modelled explicitly so
  follower/following counts and lists are cheap queries. A unique constraint
  on `(followers, followings)` prevents duplicate follow edges.
- `POSTLIKE` is the join table for the like feature, unique per `(post, user)`.
- The old `EmailOTP` entity from V0 is **removed** — there is no
  verification-pending state anymore; a `USER` row is created `is_active=True`
  directly.

## 2. System Architecture

```mermaid
flowchart LR
    subgraph Client["Browser"]
        NX["Next.js App Router\n(pages, components)"]
    end

    subgraph Frontend["Frontend — Next.js (Node/Vercel)"]
        NX --> AX["Axios client\n(lib/api.ts)"]
        AX --> AC["AuthContext\n(JWT in localStorage)"]
    end

    subgraph Backend["Backend — Django + DRF (Gunicorn)"]
        URLS["config/urls.py"] --> ACC["accounts app\n(auth, profile, follow)"]
        URLS --> BLOG["blog app\n(blogs, posts, feed, search)"]
        ACC --> ORM["Django ORM"]
        BLOG --> ORM
        JWT["SimpleJWT\n/api/token/, /api/token/refresh/"] --> ACC
    end

    subgraph Data["Data layer"]
        DB[("SQLite / Postgres")]
        MEDIA[("Media storage\n/media/")]
    end

    AX -- "HTTPS + JWT Bearer" --> URLS
    ORM --> DB
    ACC --> MEDIA
    BLOG --> MEDIA
```

## 3. Key Workflows

### 3.1 Sign-up (no email verification)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant FE as Next.js /signup
    participant API as DRF RegisterView
    participant DB as Database

    U->>FE: Fill username / @gmail.com email / password
    FE->>FE: Client-side check: email ends with @gmail.com
    FE->>API: POST /api/accounts/register/
    API->>API: Validate email domain (server-side, authoritative)
    API->>DB: Create User(is_active=True) + Profile (via signal)
    API-->>FE: 201 { user, access, refresh }
    FE->>FE: Store JWT tokens in localStorage
    FE-->>U: Redirect to /home (already logged in, no OTP step)
```

### 3.2 Login → protected route

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js
    participant API as DRF (SimpleJWT)

    U->>FE: Submit username/password on /login
    FE->>API: POST /api/token/
    API-->>FE: { access, refresh }
    FE->>FE: AuthContext.refreshUser() -> GET /api/accounts/me/
    FE-->>U: Redirect to /home
    Note over FE,API: Every subsequent request attaches\nAuthorization: Bearer <access>.\nOn 401, lib/api.ts auto-refreshes\nusing /api/token/refresh/.
```

### 3.3 Follow → personalized feed

```mermaid
sequenceDiagram
    participant U as User A
    participant FE as Next.js /profile/B
    participant API as FollowToggleView
    participant Feed as FeedAPI

    U->>FE: Click "Follow" on B's profile
    FE->>API: POST /api/accounts/follow/B/
    API-->>FE: { following: true, follower_count }
    U->>FE: Go to /home (Following Feed tab)
    FE->>Feed: GET /api/blog/feed/
    Feed->>Feed: Posts where user in Follow.followings for A
    Feed-->>FE: Paginated posts, newest first
```

### 3.4 First-time visit → landing page

```mermaid
flowchart TD
    A["User opens pieblogs.app/"] --> B["app/page.tsx redirect()"]
    B --> C["/landing"]
    C -->|"Get started"| D["/signup"]
    C -->|"Login"| E["/login"]
    D --> F["Authenticated, redirected to /home"]
    E --> F
```

## 4. Removed vs. Added in V1

| Area | V0 (Django templates) | V1 (this rebuild) |
|---|---|---|
| Frontend | Django server-rendered templates | Next.js (App Router) SPA-style client |
| Email verification | OTP sent by email, `EmailOTP` model, `verify-otp` step | **Removed.** Sign-up restricted to `@gmail.com`, account active immediately |
| Auth transport | Django session auth (mixed with partial JWT) | DRF + SimpleJWT (Bearer tokens) end-to-end |
| API layer | Mix of function/class views + partial DRF | 100% DRF (ViewSets, generics, routers) |
| Secret key | Old key from repo `.env` | Freshly generated, rotated key (see backend `.env.example`) |
| Entry point | `/` served `HomeView` template directly | `/landing` marketing page is the first stop; `/` redirects there |
| Likes | Not present | `PostLike` model + `/like/` action added |
