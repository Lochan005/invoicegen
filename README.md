# Quick Invoice PWA

Single-repo **Next.js** app (mobile-first) with a **Python + ReportLab** PDF pipeline on Vercel at **`/invoice-api/*`** via **`api/server.py`** → `backend/server.py`.

Drafts live in **`localStorage`**. **Saved invoices** are stored in **MongoDB** (`/invoice-api/invoices/...`). **Download PDF** and **email** use stateless routes that accept invoice JSON in the body. After a successful **email**, Preview shows a **centered dialog** to **save** (or update) the invoice in MongoDB.

## Run locally

1. Install Node dependencies: `npm install`
2. **Proxy API for `npm run dev`:** Copy `.env.local.example` to `.env.local` and set `BACKEND_PROXY_URL` (e.g. `http://127.0.0.1:8000`). Start FastAPI, then **restart** `npm run dev` after changing `.env.local`.
3. **`backend/.env`:** set `MONGO_URL`, `DB_NAME` for list/save/next-number. Optional: `RESEND_API_KEY`, `SENDER_EMAIL` for email.
4. Start FastAPI:

   ```bash
   uvicorn backend.server:app --reload --host 127.0.0.1 --port 8000
   ```

5. Start Next.js: `npm run dev`

During development the **PWA service worker is disabled** (`next.config.mjs`). Run `npm run build && npm start` to verify installability and `/sw.js`.

## Flow

1. **Create** — invoice number is loaded from **`GET /invoice-api/invoices/next-number`** when MongoDB is configured (otherwise a local fallback). **Preview invoice** stores the draft locally.
2. **Preview** — **Download PDF** / **Email invoice**. After email succeeds, a **modal** offers **Save invoice** (or **Update** if it already has an `id`).
3. **Saved** — list, open, and delete invoices in MongoDB.

## Project layout

- `app/` — `create`, `preview`, `saved`, styles, `manifest.ts`, app icon
- `backend/server.py` — FastAPI (MongoDB + PDF + Resend email)
- `api/server.py` — Vercel Python entry
- `vercel.json` — routes `/invoice-api/*` to Python

## Vercel environment variables

- **`MONGO_URL`**, **`DB_NAME`** — required for saved invoices and next-number on new forms
- **`RESEND_API_KEY`**, **`SENDER_EMAIL`** — for email (inbox shows **`SAITECH Engineering Pty Ltd.`** via `from`; override with optional **`SENDER_DISPLAY_NAME`**)

The web app calls **same-origin** `/invoice-api/...` only.

## PWA

- Web app manifest: `app/manifest.ts` (served at `/manifest.webmanifest`)
- Icons: `app/icon.tsx` (dynamic `/icon` route)
- Service worker: generated into `public/sw.js` on production build (gitignored)
