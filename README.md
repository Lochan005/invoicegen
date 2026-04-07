# Quick Invoice PWA

Single-repo **Next.js** app (mobile-first) with the same **Python + ReportLab** PDF pipeline exposed on Vercel at `/api/*` via `server.py` → `backend/server.py`.

## Run locally

1. Install Node dependencies: `npm install`
2. **API for `npm run dev`:** Next.js does not implement `/api` routes. Either:
   - Copy `.env.local.example` to `.env.local` and set `BACKEND_PROXY_URL` to your FastAPI origin (e.g. `http://127.0.0.1:8000`), then run the Python app so `/api/invoices` exists; **restart `npm run dev`** after changing `.env.local`, or
   - Deploy to Vercel and use the hosted site (routing sends `/api/*` to Python).
3. Set Python env for the API (same variables as Vercel; e.g. `backend/.env` loaded by `backend/server.py`).
4. Start Next.js: `npm run dev`

Example FastAPI (from repo root, with venv and deps installed):

```bash
uvicorn backend.server:app --reload --host 127.0.0.1 --port 8000
```

During development the **PWA service worker is disabled** (`next.config.mjs`). Run `npm run build && npm start` to verify installability and `/sw.js`.

## Project layout

- `app/` — App Router pages (`/create`, `/preview`, `/saved`), global styles, `manifest.ts`, app icon
- `components/` — Reusable form UI (`FormSection`, `FormInput`, `DateField`, `ProductPicker`)
- `lib/` — Invoice types, totals, date helpers, API body shaping
- `backend/server.py` — FastAPI + MongoDB + PDF + email + Drive sync
- `server.py` — Vercel Python entry that re-exports the FastAPI app
- `vercel.json` — routes `/api/*` to Python, everything else to Next

## Vercel environment variables

Configure these in the Vercel project (serverless Python reads `os.environ`):

- `MONGO_URL`
- `DB_NAME`
- `RESEND_API_KEY`
- `SENDER_EMAIL`
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_CREDENTIALS_JSON`

The web app calls **same-origin** `/api/...` only; no `EXPO_PUBLIC_BACKEND_URL` is required.

## PWA

- Web app manifest: `app/manifest.ts` (served at `/manifest.webmanifest`)
- Icons: `app/icon.tsx` (dynamic `/icon` route)
- Service worker: generated into `public/sw.js` on production build (gitignored)
