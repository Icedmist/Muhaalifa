# MuhaAlifa Repairs — Repair Tracking Platform

Full-stack rebuild of `muhaalifa_v2.html` as a Vercel-ready Next.js application.

Every repair, tracked from drop-off to pickup. Customers check status anytime with a ticket ID or QR code — no phone calls required.

**Live demo:** deploy to Vercel with one click, or run locally.

## Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + Tailwind CSS
- **Backend:** Next.js API Routes (REST) — file-backed JSON store with in-memory fallback for serverless
- **Extras:** `qrcode.react` for QR, `html-to-image` + `jspdf` for PDF/JPG receipts
- **Deploy:** Vercel (zero config)

## Features

- **Landing** — hero, tracking input, trust stats
- **Track** — search by ticket ID or phone (`/api/track?q=MA-...` or digits)
- **Staff Auth** — email-based login, roles: `Admin`, `Technician`, `Front Desk` (`/api/auth/login`)
- **Dashboard** — filterable ticket list, search, status pipeline (`/api/tickets`)
- **New Repair Wizard** — 4-step intake (device → customer → service → review), photo upload, ETA auto-estimate
- **Ticket Detail** — status pipeline, update (RBAC), printable ticket with QR, download PDF/JPG
- **Admin Console** — overview stats, staff table, pricing catalog, branding/theme, reminders (`/api/stats`, `/api/settings`)
- **Printable Ticket** — QR encodes `https://<host>/track?q=<ID>`, 320px card with all fields

## Getting Started

```bash
npm install
npm run dev    # http://localhost:3000
npm run build && npm start
```

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tickets?status=&q=` | List tickets (filter by status, search by id/name/model/phone) |
| POST | `/api/tickets` | Create ticket (body: brand, model, service, amount, paid, etc.) |
| GET | `/api/tickets/:id` | Get single ticket |
| PATCH | `/api/tickets/:id` | Update status / paid / tech |
| DELETE | `/api/tickets/:id` | Delete ticket |
| GET | `/api/track?q=` | Public tracking: exact ID or phone match (1 → ticket, N → matches) |
| POST | `/api/auth/login` | Login `{email}` → `{user:{name,role,email}}` |
| GET/PUT | `/api/settings` | Shop branding, branches, theme |
| GET | `/api/services` | Service catalog + ETA map |
| GET | `/api/staff` | Staff seed |
| GET | `/api/stats` | Revenue, outstanding, active, byService/byStatus |

## Persistence

`data/db.json` is the source of truth locally. On Vercel the filesystem is ephemeral — writes live in memory for the lifetime of the serverless function and are also attempted on disk. For production persistence, swap `lib/db.ts` with Vercel KV / Postgres / Neon (the read/write interface is already isolated).

Seed data: 5 tickets, 4 staff, default branding matches the original HTML.

## Roles

- **Admin:** full access incl. Admin console
- **Technician:** can update status + create tickets
- **Front Desk:** create tickets, read-only status

Any password works in preview — auth is email-lookup against `data/db.json` staff table.

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel → Framework: Next.js → Deploy
3. Or: `vercel --prod` from project root

`vercel.json` already configures the Next.js build. No env vars required for MVP.

## Project Structure

```
app/
  page.tsx              # landing
  track/page.tsx        # public tracking
  login/page.tsx        # staff login
  dashboard/page.tsx    # staff dashboard + wizard + detail
  admin/page.tsx        # admin console
  api/                  # REST backend
  globals.css
  layout.tsx
components/
  Header.tsx
  PrintableTicket.tsx
  NewTicketWizard.tsx
lib/
  constants.ts          # STATUS_FLOW, SERVICES, helpers
  db.ts                 # JSON persistence
data/
  db.json               # auto-seeded on first read
```

## Original

Single-file source: `muhaalifa_v2.html` (1294 lines, in-memory store) preserved at repo root for reference. Port retains identical design tokens (`--indigo #171D8D`, `--teal #0FB5C8`, etc.) and user flows.

## License

MIT — built on NEXA.
