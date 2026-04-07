# Quick Invoice PWA

Single-repo **Next.js** app (mobile-first) with a **Python + ReportLab** PDF pipeline on Vercel at **`/invoice-api/*`** (not `/api`, so Next.js does not intercept) via `server.py` → `backend/server.py`.

Invoice data stays in the **browser** (`localStorage` drafts). **Download PDF** and **email** call stateless API routes that accept the invoice JSON in the request body (no database).

## Run locally

1. Install Node dependencies: `npm install`
2. **Proxy API for `npm run dev`:** Copy `.env.local.example` to `.env.local` and set `BACKEND_PROXY_URL` (e.g. `http://127.0.0.1:8000`). Start FastAPI, then **restart** `npm run dev` after changing `.env.local`.
3. Optional: add `RESEND_API_KEY` and `SENDER_EMAIL` in `backend/.env` for email.
4. Start FastAPI:

   ```bash
   uvicorn backend.server:app --reload --host 127.0.0.1 --port 8000
   ```

5. Start Next.js: `npm run dev`

During development the **PWA service worker is disabled** (`next.config.mjs`). Run `npm run build && npm start` to verify installability and `/sw.js`.

## Flow

1. **Create** — fill the form, then **Preview invoice** (draft saved locally).
2. **Preview** — **Download PDF** or **Email invoice** (`POST /invoice-api/pdf` and `POST /invoice-api/email-invoice`).

## Project layout

- `app/` — App Router pages (`/create`, `/preview`), global styles, `manifest.ts`, app icon
- `components/` — Reusable form UI
- `lib/` — Invoice types, totals, draft counter, API payload helpers
- `backend/server.py` — FastAPI (PDF + optional Resend email)
- `server.py` — Vercel Python entry that imports the FastAPI app
- `vercel.json` — routes `/invoice-api/*` to Python, everything else to Next

## Vercel environment variables

Serverless Python reads `os.environ`. For **email** only:

- `RESEND_API_KEY`
- `SENDER_EMAIL`

The web app calls **same-origin** `/invoice-api/...` only.

## PWA

- Web app manifest: `app/manifest.ts` (served at `/manifest.webmanifest`)
- Icons: `app/icon.tsx` (dynamic `/icon` route)
- Service worker: generated into `public/sw.js` on production build (gitignored)
