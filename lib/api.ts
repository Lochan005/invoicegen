export function apiUrl(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Detect Next/SPA HTML error pages so we never show a full document in the UI */
function responseLooksLikeHtml(contentType: string | null, body: string): boolean {
  const ct = contentType ?? "";
  if (ct.includes("text/html")) return true;
  const s = body.trimStart();
  return /^<!DOCTYPE\s+html/i.test(s) || /^<html[\s>]/i.test(s);
}

function localDevApiHint(): string {
  return (
    " On local dev: start FastAPI with `uvicorn backend.server:app --host 127.0.0.1 --port 8000`, " +
    "set BACKEND_PROXY_URL=http://127.0.0.1:8000 in .env.local, then restart `npm run dev` (restarts pick up .env.local)."
  );
}

function vercelApiHint(): string {
  return (
    " On Vercel: do not set BACKEND_PROXY_URL in project env (that breaks /invoice-api). " +
    "Open the deployment Logs → filter for the Python / serverless function. " +
    "Sanity-check GET /invoice-api/ in the browser."
  );
}

function proxyFailureHint(): string {
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h !== "localhost" && h !== "127.0.0.1") return vercelApiHint();
  }
  return localDevApiHint();
}

export function summarizeApiFailure(res: Response, bodyText: string): string {
  const status = res.status;
  const ct = res.headers.get("content-type");
  if (responseLooksLikeHtml(ct, bodyText)) {
    if (status === 404) {
      return (
        "Invoice API not found (404). On local dev, start FastAPI (uvicorn backend.server:app --port 8000) " +
        "and set BACKEND_PROXY_URL in .env.local so /invoice-api is proxied. See README."
      );
    }
    if (status === 500 || status === 502 || status === 503) {
      return (
        `Could not get a JSON response from the invoice API (HTTP ${status}, HTML error page).` +
        proxyFailureHint()
      );
    }
    return `Server returned HTML instead of JSON (HTTP ${status}). Is the API running?`;
  }

  try {
    const data = bodyText ? JSON.parse(bodyText) : {};
    const d = data?.detail;
    if (typeof d === "string") {
      if (d === "Internal Server Error" && status >= 500) {
        return `${d}.${proxyFailureHint()}`;
      }
      return d;
    }
    if (Array.isArray(d))
      return d.map((x: { msg?: string }) => x?.msg || JSON.stringify(x)).join("; ");
    if (d != null && typeof d === "object") return JSON.stringify(d);
    if (data?.message && typeof data.message === "string") return data.message;
    const t = bodyText.trim();
    return (t.length > 200 ? `${t.slice(0, 200)}…` : t) || res.statusText || `HTTP ${status}`;
  } catch {
    const t = bodyText.trim();
    return (t.length > 200 ? `${t.slice(0, 200)}…` : t) || res.statusText || `HTTP ${status}`;
  }
}

export async function parseApiError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  return summarizeApiFailure(res, text);
}

/** Use after a successful status when body must be JSON */
export async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const ct = res.headers.get("content-type") ?? "";
  if (responseLooksLikeHtml(ct, text)) {
    throw new Error(summarizeApiFailure(res, text));
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const t = text.trim().slice(0, 120);
    throw new Error(t ? `Invalid JSON: ${t}` : "Empty API response");
  }
}
