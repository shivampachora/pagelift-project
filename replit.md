# Workspace

## Overview

**LocalSite** — A full-stack SaaS web app where small businesses can get a professional website on a monthly subscription.

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Auth**: Session-based (express-session + bcrypt)

## Features

1. **Landing Page** (`/`) — Hero section, features list, Create Account / Login buttons
2. **User Signup** (`/signup`) — Name, Business Name, Phone, Email, Password
3. **User Login** (`/login`) — Email + Password, session-based auth
4. **Customer Dashboard** (`/dashboard`) — Business Name, Website URL, Subscription Status, Plan Price, Next Payment Date. Shows "being prepared" message if no plan yet. Status badges: Green=ACTIVE, Yellow=READY_FOR_PAYMENT, Red=EXPIRED. "Activate Subscription" button when READY_FOR_PAYMENT.
5. **Admin Panel** (`/admin`) — Separate admin login (admin@localsite.com / admin123). Table of all users with edit controls for: Website URL, Plan Price (₹199/₹299/₹499), Subscription Status, Next Payment Date.
6. **Payment Simulation** — Clicking "Activate Subscription" sets status=ACTIVE and next_payment_date=today+30 days.

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/routes/
│   │       ├── auth.ts     # Signup, login, logout, /me
│   │       ├── dashboard.ts # User dashboard data
│   │       ├── subscription.ts # Activate subscription
│   │       └── admin.ts    # Admin login, users CRUD
│   └── localsite/          # React + Vite frontend (served at /)
│       └── src/
│           ├── pages/      # home, login, signup, dashboard, admin/
│           └── components/ # Shared UI components
├── lib/
│   ├── api-spec/openapi.yaml # OpenAPI contract
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas
│   └── db/src/schema/users.ts # users table schema
```

## Database Schema

**users** table:
- id, name, business_name, phone, email, password_hash
- website_url, plan_price, subscription_status, next_payment_date
- created_at

## Admin Credentials

- Email: `admin@localsite.com`
- Password: `admin123`

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `POST /api/subscription/activate`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
