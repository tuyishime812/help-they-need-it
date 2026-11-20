# Help They Need Foundation

A modern, responsive multi-page Next.js website for the **Help They Need Foundation**, with secure online donations, real-time tracking, and an admin operations dashboard backed by Supabase.

## Tech stack

- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (PostgreSQL) for persistent tracking of donations, revenue, and support requests
- **Payment integration** via inline payment popup (server-side prepare/verify/webhook flow)
- **Live admin dashboard** with real-time updates (SSE + polling fallback), animations, filters, case status updates, and CSV export

## Features

- Multi-page public site: Home, About, Programs, How We Help, Stories, FAQ, Donate, Get Help
- Responsive design (mobile + desktop) with light/dark mode toggle
- Donation flow with branch selection (Older people, Students, Refugees, Families), currency support (MWK/USD), and server-side verification
- Real-time revenue and impact tracking (successful/pending/failed donations, branch totals, open requests)
- Admin dashboard (`/admin`) for operations and case management
- Newsletter and support request forms

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create/update `.env` (or `.env.local`) based on `.env.example`:

```bash
# Supabase (required for real data/revenue tracking)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Payment provider (inline popup + server-side verification)
NEXT_PUBLIC_PAYCHANGU_PUBLIC_KEY=your_public_key
PAYCHANGU_SECRET_KEY=your_secret_key
PAYCHANGU_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security:** Keep `SUPABASE_SERVICE_ROLE_KEY`, `PAYCHANGU_SECRET_KEY`, and `PAYCHANGU_WEBHOOK_SECRET` server-side only. Never expose them in client code or commit them to git.

### 3. Set up Supabase database

1. Create a Supabase project
2. Open the SQL Editor and run: `supabase/schema.sql`
3. Confirm tables are created: `public.donations`, `public.requests`

This enables persistent real tracking for donations/revenue and support requests.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key routes

- `/` Home (live tracked impact/revenue summary)
- `/about`, `/programs`, `/how-we-help`, `/stories`, `/faq`
- `/donate` Secure donation form (branch/currency/frequency tracking)
- `/get-help` Support/volunteer/partnership request form
- `/admin` Admin dashboard (demo login)
- `/payment/callback`, `/payment/return` Payment result/verification pages

## API routes

- `POST /api/payments/prepare` Create pending donation + payment session data
- `GET /api/payments/confirm?tx_ref=...` Verify payment status server-side and update record
- `POST /api/payments/webhook` Webhook handler (signature check if configured + server-side verification)
- `GET /api/donations`, `POST /api/donations`
- `GET /api/requests`, `POST /api/requests`, `PATCH /api/requests` (update case status)
- `GET /api/stats` Aggregated real-time stats/revenue
- `GET /api/stream` SSE stream for live dashboard updates

## Admin dashboard

- URL: `/admin`
- **Current auth:** demo-only gate (password: `admin123`, client-side session storage)
- Tracks: verified revenue (MWK/USD), monthly recurring, branch totals, donation statuses, live activity, and support request cases

> **Production note:** Replace demo admin auth with real server-side authentication and RBAC before deploying publicly.

## Build & production

```bash
npm run build
npm start
```

### Deployment notes

- Set all required environment variables in your hosting provider (Vercel, etc.)
- Set `NEXT_PUBLIC_APP_URL` to your production domain
- Configure payment webhook URL to: `https://<your-domain>/api/payments/webhook`
- Run `supabase/schema.sql` in your production Supabase project

## Security & production hardening checklist

- [ ] Replace demo admin auth with server-side auth/RBAC and protect admin/API routes
- [ ] Keep service/secret keys server-side only; rotate keys if exposed
- [ ] Add idempotency and reconciliation for payment webhooks/confirmations (`tx_ref`, amount, currency)
- [ ] Add rate limiting, bot/spam protection, CSRF protections where applicable, and CSP/security headers
- [ ] Enable/verify Supabase RLS and access policies appropriate for your architecture
- [ ] Add audit logging, monitoring, and backups
- [ ] Implement true recurring billing flow if required for monthly donations (provider-dependent)

## Project structure (high level)

- `src/app/(site)/...` Public pages
- `src/app/admin/...` Admin dashboard
- `src/app/api/...` API routes (payments, tracking, stats, stream)
- `src/components/site/...` Shared site UI components
- `src/components/AdminDashboard.tsx` Admin dashboard UI
- `src/lib/store.ts` Data access + stats aggregation (Supabase-backed)
- `src/lib/supabase.ts` Supabase server client
- `src/lib/paychangu.ts` Payment verification/signature helpers
- `supabase/schema.sql` Database schema for real tracking
