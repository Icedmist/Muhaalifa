# MuhaAlifa — Improvements, Logos & Permissions Audit

## 1) Logos

### Before
- Single inline SVG glyph in `components/Header.tsx:8` (`<rect rx=9>` + `<>` device icon).
- Uploaded shop logo stored as base64 `data:` in `data/db.json:settings.logo` (no file, no variants, big JSON).
- No favicon, no OG image, no static assets — `public/` was empty.

### After (this update)
| File | Purpose | Size |
|------|---------|------|
| `public/logo.svg` | Lightbg full lockup (glyph + “MuhaAlifa REPAIRS”) — header, docs | 977 B |
| `public/logo-dark.svg` | Dark variant — sidebar, footer on `#0B1220` | 933 B |
| `public/logo-icon.svg` | Square glyph only — favicon source, app icon | 658 B |
| `public/favicon.svg` | 32×32 browser favicon (indigo `#171D8D`) — `app/layout.tsx:icons` | 519 B |
| `public/og-image.svg` | 1200×630 OG for WhatsApp/X — `app/layout.tsx:openGraph.images` | 1.8 kB |

- `components/Header.tsx:Brandmark` now supports `variant="default"|"dark"|"icon"` + `size` prop, prefers uploaded `settings.logo` but falls back to file logos. Footer uses `variant="dark"`.
- Admin → Branding now previews uploaded vs default pack and links to each file (`/logo.svg` etc.).
- `original.html` glyph preserved for reference; token gradient `#171D8D → #1D53B7 → #0FB5C8` unchanged.

**Recommendations**
- Export PNGs `logo@2x.png`/`logo@3x.png` + `.ico` for older browsers. Add to `public/` and reference in `metadata.icons`.
- For print receipts: keep glyph in SVG (crisp) but also offer `logo-print.png` (monochrome) for thermal printers.
- Store uploaded logos to Vercel Blob / S3, not base64 in JSON (hits 4.5 MB limit, bloats `db.json`). Add `logoUrl` field.

---

## 2) Users & Permissions

### Current users (seed `data/db.json:staff` → `lib/constants.ts:STAFF_SEED`)
| Name | Email | Role | Tickets | Can do |
|------|-------|------|---------|--------|
| MuhaAlifa | `admin@muhaalifa.app` | **Admin** | 0 | Everything. Overview, staff, catalog, branding, reminders, analytics, delete. |
| Bello Sani | `bello@muhaalifa.app` | Technician | 14 | View/create tickets, **update status** along pipeline + cancel. Cannot access Admin console. |
| Grace Okon | `grace@muhaalifa.app` | Technician | 9 | Same as Bello |
| Fatima Sule | `fatima@muhaalifa.app` | Front Desk | 5 | View/create tickets, view device/customer, **read-only status** (client shows disabled, server now enforces 403). No Admin access. |

All 4 shown in Admin → Staff & Permissions (`app/admin/page.tsx:staff` tab) with **YOU** badge for current session. Matrix under it visualises every permission.

### Permission matrix (central `lib/permissions.ts:PERMISSIONS`)
| Permission | Min role | Front Desk | Technician | Admin |
|------------|:---:|:---:|:---:|:---:|
| `tickets:read` | Front Desk | ✓ | ✓ | ✓ |
| `tickets:create` | Front Desk | ✓ | ✓ | ✓ |
| `tickets:update_status` | **Technician** | — | ✓ | ✓ |
| `tickets:delete` | Admin | — | — | ✓ |
| `customers:read` | Front Desk | ✓ | ✓ | ✓ |
| `settings:read` | Front Desk | ✓ | ✓ | ✓ |
| `settings:write` | Admin | — | — | ✓ |
| `services:read` | Front Desk | ✓ | ✓ | ✓ |
| `services:write` | Admin | — | — | ✓ |
| `staff:read` | Admin | — | — | ✓ |
| `staff:write` | Admin | — | — | ✓ |
| `stats:read` | Admin | — | — | ✓ |
| `admin:access` | Admin | — | — | ✓ |

### What was insecure (fixed now)
- **Client-only guard**: `app/dashboard/page.tsx:canUpdate = role !== "Front Desk"` and `app/admin/page.tsx:role!=="Admin" redirect` could be bypassed via `curl`.
- **No server check**: `app/api/tickets/[id]/route.ts:PATCH`, `app/api/tickets/route.ts:POST`, `app/api/settings/route.ts:PUT`, `app/api/staff|stats:GET` had zero auth.
- **Any password** worked and was not validated.

### Fix shipped
- `lib/permissions.ts` is the SSOT (client + server). `lib/auth.ts` enforces it server-side via `requirePermission(req,perm)` reading `x-user-email` (DB role authoritative; header role ignored). Returns **401** if no email, **403** if rank too low.
  - `PATCH /api/tickets/[id]` → `tickets:update_status`
  - `POST /api/tickets` → `tickets:create`
  - `DELETE /api/tickets/[id]` → `tickets:delete`
  - `PUT /api/settings` → `settings:write`
  - `GET /api/stats` → `stats:read`
  - `GET /api/staff` → `staff:read`
- `lib/client.ts:authFetch` auto-sends `x-user-email` + `x-user-role` from `localStorage:muha_session`. Dashboard + Admin + Wizard now use it.
- Admin Staff tab now explains header auth, lists demo logins, shows 403 on failure.

### Still recommended
- Replace header auth with **HttpOnly cookie + JWT** + `middleware.ts` (Next.js) verifying signature; add `bcrypt` password hashes to `staff` (add `passwordHash` field, seed `admin123` etc.). Stop “any password”.
- Add **audit log** `ticket_events` (who moved status when, from → to, reason) — required for disputes.
- Add **soft delete** + branch scoping (Front Desk at branch A shouldn’t see branch B tickets).
- Rate-limit `/api/auth/login` and `/api/track`.

---

## 3) Feature improvements — prioritized

### Quick wins (1–2 days)
- [x] Favicon + OG image.
- [x] Server RBAC.
- [ ] Pagination + sorting on `/api/tickets` (`?page=&limit=&sort=`) — list will grow past 50.
- [ ] Debounce search + empty/loading skeletons in Dashboard.
- [ ] Validate IMEI (Luhn), phone (NG format), photo (≤2 MB, image/*).
- [ ] Currency input with locale (`Intl.NumberFormat`).
- [ ] Print CSS for tickets (`@media print` hides nav).

### Security hardening
- HttpOnly JWT, `middleware.ts` protecting `/dashboard` + `/admin` (301 → `/login`).
- Zod schemas for `POST /api/tickets`, `PUT /api/settings`.
- CSRF for cookie auth, CSP headers in `next.config.js`.
- Upload to Vercel Blob (presigned URLs), not base64.

### Product delight
- **Status timeline with timestamps** — store `history: {status, at, by}[]` on ticket; show in track view (“Diagnosis by Grace — 2h ago”).
- **WhatsApp/SMS via Termii/Twilio** — Admin → Reminders already has toggles; hook `PATCH status` to trigger `await termii.send(custPhone, "Ready for pickup: MA-X")`.
- **Payment ledger** — `payments: {amount, at, method}[]` + “Mark paid” button; outstanding computed from ledger, not single `paid` field.
- **Multi-branch** — add `branchId` on tickets + branch switcher in header; branch-scoped queries.
- **Analytics** — `/admin` overview already has revenue; add `recharts` for 7-day intake, turnaround p50/p95.
- **PWA** — `manifest.json` + offline track cache (customer at shop with poor signal).

### Tech debt
- `data/db.json` → Vercel Postgres/Neon + Prisma or Drizzle (migration keeps `getDb()` interface).
- `html-to-image` + `jspdf` client-only; consider server PDF via `@react-pdf/renderer` or `puppeteer` API route.
- Add `vitest` + `playwright` (track flow, RBAC). CI via GitHub Actions → Vercel preview.

---

## 4) How to demo permissions

1. `/login` → `admin@muhaalifa.app` (any password) → `/dashboard` shows “Admin console” link. Open a ticket → status buttons enabled. `/admin` loads.
2. Sign out → `fatima@muhaalifa.app` (Front Desk) → dashboard → ticket detail shows “only technicians…” notice, no buttons. Try `curl`:
   ```
   curl -X PATCH http://localhost:3000/api/tickets/MA-7F3K2 \
     -H "Content-Type: application/json" -H "x-user-email: fatima@muhaalifa.app" \
     -d '{"status":"ready"}'
   # → 403 {"error":"Forbidden — Front Desk cannot perform tickets:update_status. Requires Technician."}
   ```
3. `bello@muhaalifa.app` (Technician) → can PATCH, cannot `PUT /api/settings` (403) nor view `/admin`.

All enforced at `lib/auth.ts:requirePermission`.

---

## 5) Deploy checklist
- `npm run build` ✓ (now 4.18 kB `/`, 7.43 kB `/admin`, etc.)
- `public/*` will serve from Vercel edge.
- Set env `VERCEL=1` is auto; no secrets needed for MVP.
- Add Vercel env `DATABASE_URL` + Blob token when migrating persistence.
