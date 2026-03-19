# IauVacanta Frontend

React + TypeScript + Vite single-page app connected to the ASP.NET Core backend from backend/IauVacanta.Backend.

## Prerequisites

- Node.js 20+
- npm 10+
- ASP.NET Core backend running from backend/IauVacanta.Backend
- PostgreSQL configured for the backend

## Environment

Configure the backend API base URL in .env:

```env
VITE_API_BASE_URL=https://localhost:7053/api
```

If your backend runs on another URL/port, update this value.

## Install and run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Connected backend features

- Authentication with POST /api/auth/register and POST /api/auth/login
- JWT access token stored in local storage
- Refresh token handled via secure HTTP-only cookie
- Place listing loaded from GET /api/place
- Place creation from owner dashboard via POST /api/place
- Reservation requests from property details via POST /api/reservation
- Admin moderation panel for pending places via:
  - GET /api/place/pending
  - PATCH /api/place/{id}/approval

## Admin visibility behavior

- Admin panel is available at /dashboard/admin.
- The route is visible/accessible only for authenticated users with isAdmin=true.
- Non-admin users are redirected away from admin route.
