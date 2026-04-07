const STORAGE_KEY = "invoice:lastNum";

function readLast(): number {
  const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  const n = parseInt(raw || "0", 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Next display number (001, 002, …) without persisting until `rememberInvoiceNumber`. */
export function peekNextInvoiceNumber(): string {
  const next = readLast() + 1;
  return String(next).padStart(3, "0");
}

/** After preview (or when committing a draft), store the highest numeric invoice # seen. */
export function rememberInvoiceNumber(invoiceNumber: string): void {
  if (typeof window === "undefined") return;
  const digits = invoiceNumber.replace(/\D/g, "");
  const n = parseInt(digits || "0", 10);
  if (!Number.isFinite(n) || n <= 0) return;
  const last = readLast();
  if (n > last) localStorage.setItem(STORAGE_KEY, String(n));
}
