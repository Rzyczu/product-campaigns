# Emerald — Product Campaigns (CRUD)

A compact full‑stack app that manages **products** and **ad campaigns** with login, wallet balance, and server‑side funds validation. Frontend: **Vite + React + SCSS**. Backend: **Express (TypeScript) + PostgreSQL** (Neon).

## Features
- **Authentication** (cookie session; seeded demo user).
- **Products**: list, create, rename, delete.
- **Campaigns** per product: create, edit, delete, list.
  - Fields: name, keywords (typeahead), bid amount, campaign fund, status (on/off), town (dropdown with search), radius (km).
  - **Funds validation**: API pre‑check + DB triggers; returns `409 INSUFFICIENT_FUNDS` with `missing_cents`.
  - **Town safeguard**: if a non‑existent town is typed (e.g. “XYZ”), the first available town is selected (alphabetical, e.g. Bydgoszcz).
- **Wallet**: balance visible in the top bar; **Deposit** popover; auto‑refresh after mutations.
- **UX**: React Hook Form + Zod, React Query 5, toasts, debounced typeaheads, responsive tables (label–value on mobile), mobile hamburger menu, lucide icons, emerald logo + favicon.

## Tech Stack
**Backend**: Node 20+, Express 5 (TS), pg, dotenv, cors, cookie-parser  
**Frontend**: React 19, Vite, React Router, React Query 5, RHF + Zod, Zustand, SCSS, lucide-react  
**DB**: PostgreSQL (Neon/Supabase), schema + views + triggers

## Requirements
- Node.js ≥ 20
- PostgreSQL (connection URI – Neon/Supabase)
- npm or pnpm (examples use npm)

## Quick Start

### 1) Backend (Express + TypeScript)
```bash
cd server
cp .env    # edit values
npm i
npm run dev
```
Server on **http://localhost:4000** by default. On first run a demo user is **seeded** based on `.env`.

### 2) Frontend (Vite + React)
```bash
cd frontend
cp .env    # set VITE_API_URL=http://localhost:4000
npm i
npm run dev
```
App runs on **http://localhost:5173** (Vite will suggest another port if taken).

## Directory Layout
```
repo/
├─ server/
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ config/db.ts
│  │  ├─ middlewares/{auth,error}.ts
│  │  ├─ lib/funds.ts
│  │  ├─ routes/{auth,wallet,products,campaigns}.ts
│  │  └─ types.ts
│  └─ .env.example
├─ frontend/
│  ├─ src/
│  │  ├─ app/{App.tsx,Layout.tsx,router.tsx,providers/*}
│  │  ├─ features/{auth,products,campaigns,keywords,towns}
│  │  ├─ components/{Toast,MoneyInput}
│  │  ├─ lib/{format,errors,utils,validators,constants}
│  │  ├─ pages/{LoginPage,Campaigns*,Products*}
│  │  └─ styles/{app.scss,variables.scss,mixins.scss}
│  ├─ public/{emerald.png,favicon.*}
│  └─ .env.example
└─ sql/
```

## API (Brief)

### Auth
- `POST /auth/login` – `{ email, password }` → sets session cookie
- `POST /auth/logout`
- `GET /auth/me` – `{ id, email, name, balance_cents }`

### Wallet
- `POST /wallet/deposit` – `{ amount_cents }` → returns updated user

### Products
- `GET /products`
- `POST /products` – `{ name }`
- `PUT /products/:id` – `{ name }`
- `DELETE /products/:id`

### Campaigns
- `GET /campaigns`
- `GET /campaigns/:id`
- `POST /campaigns` – `{ product_id, name, bid_amount_cents, fund_cents, status, town_id, radius_km, keywords[] }`
- `PUT /campaigns/:id` – any subset of fields + `keywords[]`
- `DELETE /campaigns/:id`

**Insufficient funds**: API returns
```json
{ "error": "Insufficient funds", "code": "INSUFFICIENT_FUNDS", "missing_cents": 12345 }
```
(we use 409 Conflict).

## Notes
- Funds are verified **twice**: API pre‑check in a DB transaction (`SELECT ... FOR UPDATE`) and DB triggers as a last line of defense.
- Frontend recognizes `INSUFFICIENT_FUNDS` and shows a toast; the top‑bar “Deposit” popover allows quick balance top‑ups.
- Mobile: responsive tables (label–value), inline action icons, hamburger menu; desktop keeps classic table layout.
- Branding: logo and favicon in `public/favicon.png`
