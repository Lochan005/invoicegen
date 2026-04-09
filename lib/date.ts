/** DD/MM/YYYY -> YYYY-MM-DD for `<input type="date">` */
export function toHTMLDate(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  const p = ddmmyyyy.split("/");
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : "";
}

/** YYYY-MM-DD from date input -> DD/MM/YYYY */
export function fromHTMLDate(htmlDate: string): string {
  if (!htmlDate) return "";
  const p = htmlDate.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : "";
}

export function daysInMonth(month: number, year: number): number {
  if (month < 1 || month > 12 || !Number.isFinite(year)) return 31;
  return new Date(year, month, 0).getDate();
}

/** Parse DD/MM/YYYY; clamps day to valid days in month. Returns null if empty or invalid. */
export function parseDdMmYyyy(s: string): { day: number; month: number; year: number } | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const p = trimmed.split("/");
  if (p.length !== 3) return null;
  const day = Number(p[0]);
  const month = Number(p[1]);
  const year = Number(p[2]);
  if (![day, month, year].every((n) => Number.isInteger(n))) return null;
  if (month < 1 || month > 12 || year < 1 || day < 1) return null;
  const dim = daysInMonth(month, year);
  const d = Math.min(day, dim);
  const dt = new Date(year, month - 1, d);
  if (dt.getFullYear() !== year || dt.getMonth() !== month - 1 || dt.getDate() !== d) return null;
  return { day: d, month, year };
}

export function toDdMmYyyy(day: number, month: number, year: number): string {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function addOneMonth(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  date.setMonth(date.getMonth() + 1);
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}
