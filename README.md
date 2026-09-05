# Muhaalifa repairs — repair tracking platform

> Every repair, tracked from drop-off to pickup. Customers check status anytime with a ticket ID or QR code — no phone calls required.

Full-stack rebuild of `muhaalifa_v2.html` (1294 lines, single-file prototype) as a production-ready Next.js app deployable to Vercel. Ships with JWT auth, role-based access, audit history, and payment ledger.

**Live demo:** `vercel --prod` or push to GitHub → Vercel import. See [Deploy to Vercel](#deploy-to-vercel) below.

## Description

Muhaalifa is a lightweight repair shop OS for phone technicians in Jalingo and beyond. Staff log a device in under 60 seconds, get a `MA-XXXXX` ticket and QR receipt; customers track on `/track` with no login. Built for the bench, not a boardroom — one ticket, one pipeline, one QR code that does the explaining.

**Stack:** Next.js 14 (App Router) · React 18 · Tailwind CSS · Next.js API routes · `qrcode.react` · `html-to-image` + `jspdf` · `bcryptjs` + `jsonwebtoken`/`jose` · Vercel (iad1).

## Features

- **Landing** — hero, tracking input, how it works (3 steps), trust stats
- **Track** — search by ticket ID or phone (`/api/track?q=`), pipeline + 6-entry update history, device summary, PDF/JPG receipt
- **Staff auth** — email + password → HttpOnly `muha_token` (JWT, 7d), `middleware.ts` guards `/dashboard` and `/admin`
- **Dashboard** — filterable ticket list (status chips, search, `branch`), 4-step wizard (brand/model, customer, service, review), photo upload, ETA auto-estimate
- **Ticket detail** — status pipeline (RBAC), audit timeline (`history: {from,to,at,by}[]`), device & customer, payment ledger (`payments: {amount,at,by,method}[]`), add payment (cash/transfer/POS), printable 320px ticket with QR, download PDF/JPG
- **Admin console** — overview (total, revenue, outstanding, turnaround), per-tech job counts, staff & permissions matrix (13 permissions, `YOU` badge), pricing catalog, branding & theme (logo pack + accent), branches, reminders (Termii/Twilio-ready)
- **Logos** — `/public/logo.svg` (light), `/logo-dark.svg` (dark), `/logo-icon.svg` (glyph), `/favicon.svg`, `/og-image.svg` (1200×630)
- **Middleware** — edge guard for `/dashboard` (`any staff`) and `/admin` (`Admin` only), redirect to `/login?next=`

## Getting started

```bash
npm install
cp .env.example .env.local  # set JWT_SECRET
npm run dev    # http://localhost:3000
npm run build && npm start
```

Demo logins (password required, bcrypt-hashed in `lib/constants.ts:41`):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@muhaalifa.app` | `Admin123!` |
| Technician | `bello@muhaalifa.app` | `Tech123!` |
| Technician | `grace@muhaalifa.app` | `Tech123!` |
| Front desk | `fatima@muhaalifa.app` | `Desk123!` |

## Api reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tickets?status=&q=&branch=` | `tickets:read` (Front desk+) | List (newest first), filter by status/branch, search id/name/model/phone |
| POST | `/api/tickets` | `tickets:create` | Create `{brand, model, service, amount, paid, branch}` → `{ticket}` (seeds `history` + `payments`) |
| GET | `/api/tickets/:id` | public | Get single ticket |
| PATCH | `/api/tickets/:id` | `tickets:update_status` for `status`/`amount`, `tickets:create` for `addPayment` | Body: `{status}` appends audit, `{addPayment, paymentMethod}` appends ledger |
| DELETE | `/api/tickets/:id` | `tickets:delete` (Admin) | Remove ticket |
| GET | `/api/track?q=` | public | Exact ID or phone match (1 → `ticket`, N → `matches`) |
| POST | `/api/auth/login` | public | `{email, password}` → `{user}` + `Set-Cookie: muha_token` |
| POST | `/api/auth/logout` | — | Clears `muha_token` |
| GET | `/api/auth/me` | cookie/header | Returns `{user}` or 401 |
| GET/PUT | `/api/settings` | GET public, PUT `settings:write` (Admin) | Shop name, address, phone, accent, footer, logo, branches |
| GET | `/api/services` | public | Service catalog + `eta` map |
| GET | `/api/staff` | `staff:read` (Admin) | Staff seed + password hashes omitted in response |
| GET | `/api/stats` | `stats:read` (Admin) | `{total, revenue, outstanding, active, byService, byStatus}` |

All protected routes check `lib/auth.ts:requirePermission` via `lib/jwt.ts` cookie (fallback `x-user-email` header for CLI). Returns `401` (unauthenticated) or `403` (wrong role).

## Roles & permissions

Source: `lib/permissions.ts:PERMISSIONS`. Rank: Front desk (1) < Technician (2) < Admin (3).

| Permission | Min role | Front desk | Technician | Admin |
|------------|:--------:|:----------:|:----------:|:-----:|
| `tickets:read` | Front desk | ✓ | ✓ | ✓ |
| `tickets:create` | Front desk | ✓ | ✓ | ✓ |
| `tickets:update_status` | Technician | — | ✓ | ✓ |
| `tickets:delete` | Admin | — | — | ✓ |
| `settings:write` | Admin | — | — | ✓ |
| `staff:read` | Admin | — | — | ✓ |
| `stats:read` | Admin | — | — | ✓ |

Full matrix in **Admin → Staff & permissions** `app/admin/page.tsx:93`. Client mirrors server via `lib/client.ts:authFetch` (`credentials: include`).

## Persistence

`data/db.json` is the source locally. On Vercel the filesystem is ephemeral — `lib/db.ts:68` keeps an in-memory `mem` fallback per lambda lifetime. For production, swap `lib/db.ts` with Vercel Postgres/Neon + Prisma/Drizzle (interface already isolated: `readDb()`/`writeDb()`). Seeds 5 tickets (with `history` + `payments` + `branch`) and 4 staff.

## Logos & branding

| File | Use |
|------|-----|
| `public/logo.svg` | Light lockup — header |
| `public/logo-dark.svg` | Dark — sidebar/footer |
| `public/logo-icon.svg` | Glyph — favicon source |
| `public/favicon.svg` | Browser favicon (`app/layout.tsx:icons`) |
| `public/og-image.svg` | OG 1200×630 (`openGraph.images`) |

`components/Header.tsx:Brandmark` supports `variant="default"|"dark"|"icon"` + `size`. Admin → Branding previews upload vs pack. For thermal receipts add a monochrome `logo-print.png`.

## Deploy to Vercel

```bash
vercel link --yes  # links to iced-mist-s-projects/muhaalifa (prj_YYBF6ag6S6yLirZ1KBSIRbXlebJc)
vercel env add JWT_SECRET production  # muhaalifa-prod-secret-32chars-change-me-v2!
vercel --prod --yes
```

`vercel.json` already sets `framework: nextjs`, `regions: ["iad1"]`. `middleware.ts:1` (43.3 kB) runs on edge. No extra env required for demo; set `JWT_SECRET` for prod.

## Project structure

```
app/
  page.tsx              # landing
  track/page.tsx        # public tracking (+ history)
  login/page.tsx        # email + password, ?next handling
  dashboard/page.tsx    # list, wizard, detail (timeline + ledger)
  admin/page.tsx        # overview, staff & permissions, branding
  api/                  # REST — tickets, track, auth/*, settings, staff, stats
  layout.tsx            # fonts, icons, OG
  globals.css
middleware.ts           # edge guard
components/
  Header.tsx            # Brandmark variants
  PrintableTicket.tsx   # 320px QR ticket
  NewTicketWizard.tsx   # 4-step intake
lib/
  constants.ts          # STATUS_FLOW, SERVICES, STAFF_SEED (hashes), helpers
  db.ts                 # JSON + mem fallback, makeHistory()
  permissions.ts        # 13-permission matrix
  auth.ts               # requirePermission (JWT cookie → header fallback)
  jwt.ts                # sign/verify + cookieOptions
  jwt-edge.ts           # jose edge helper
  client.ts             # authFetch (credentials:include)
public/
  logo.svg, logo-dark.svg, logo-icon.svg, favicon.svg, og-image.svg
data/
  db.json               # auto-seeded
```

## What's missing (roadmap)

- **Persistence:** Postgres/Neon migration, Vercel Blob for logo/photo uploads (base64 bloats JSON)
- **Search:** pagination (`?page&limit`) + sorting, debounce + skeletons
- **Security:** Zod schemas, CSP headers, rate-limit `track`/`login`, `VERCEL_OIDC_TOKEN` rotation
- **Product:** WhatsApp/SMS on `ready` (Termii), multi-branch scoping, `recharts` analytics, PWA manifest, print CSS
- **Tests:** `vitest` + `playwright` (track + RBAC flows)

## Original

`muhaalifa_v2.html` (1294 lines, in-memory store) → `original.html` at repo root. Design tokens preserved: `--indigo #171D8D`, `--blue #1D53B7`, `--teal #0FB5C8`.

## License

MIT — built on NEXA.
