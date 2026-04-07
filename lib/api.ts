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

export function summarizeApiFailure(res: Response, bodyText: string): string {
  const status = res.status;
  if (responseLooksLikeHtml(res.headers.get("content-type"), bodyText)) {
    if (status === 404) {
      return (
        "Invoice API not found (404). On local dev, Next.js does not serve /api — start FastAPI " +
        "and set BACKEND_PROXY_URL in .env.local (e.g. http://127.0.0.1:8000). See README."
      );
    }
    return `Server returned HTML instead of JSON (HTTP ${status}). Is the API running?`;
  }

  try {
    const data = bodyText ? JSON.parse(bodyText) : {};
    const d = data?.detail;
    if (typeof d === "string") return d;
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
