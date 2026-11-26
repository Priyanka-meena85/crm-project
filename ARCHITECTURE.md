# Priya Boutique CRM — System Architecture

## 1. High-Level Architecture

```
Browser (Next.js App Router)
 ├── /login         -> NextAuth Credentials + Role Redirect
 ├── /shop          -> Staff & Owner POS Billing + Stock Check
 └── /dashboard     -> Owner Command Center (RBAC Protected via middleware.ts)
       │
       ├── API Layer (/app/api/*)
       │     ├── /api/auth/[...nextauth]  (JWT Session + Role Claims)
       │     ├── /api/leads               (Leads, Kanban Pipeline, History)
       │     ├── /api/customers           (360° Profile, VIP/Inactive Logic)
       │     ├── /api/bills               (Atomic Billing + Stock Decrement + PDF)
       │     ├── /api/products            (Size-wise Inventory + Price Edit)
       │     ├── /api/omnichannel         (Orders, COD Shield, Carts, Integrations)
       │     ├── /api/inbox               (Unified Omnichannel Support Chat)
       │     ├── /api/udhaar              (Credit Ledger + WhatsApp Reminders)
       │     ├── /api/measurements        (Stitching & Tailor Slip)
       │     └── /api/reports & /settings (Analytics + JSON Backup)
       │
       └── Persistence Layer
             ├── Primary: PostgreSQL via Prisma ORM (prisma/schema.prisma)
             └── Fallback: In-memory Demo Store (lib/demo-store.ts, leads-store.ts)
```

## 2. Directory Structure

- `app/` — Next.js App Router pages and REST API route handlers
- `components/` — Reusable UI primitives (`BoutiqueEffects.tsx`, `CssIcons.tsx`, `Navbar.tsx`)
- `components/dashboard/` — Modular Owner Dashboard sub-panels (`DashboardSidebar.tsx`, `ReportsPanel.tsx`, `SettingsPanel.tsx`)
- `types/` — Shared TypeScript domain contracts (`crm.ts`)
- `lib/` — Auth, Prisma client, PDF generator (`pdf-lib`), WhatsApp/Cloudinary helpers, and demo fallback stores
- `prisma/` — PostgreSQL schema & deterministic seed script

## 3. Security & Role-Based Access Control (RBAC)

- **Middleware (`middleware.ts`)**: Enforces authenticated JWT sessions on `/shop` and `/dashboard`, and redirects `STAFF` users away from `/dashboard`.
- **Zero-Emoji Pure CSS Iconography**: All icons are rendered via pure CSS geometry in `components/CssIcons.tsx` for lightweight bundles and consistent boutique styling.
