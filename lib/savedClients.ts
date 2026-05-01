import type { Invoice, CompanyDetails } from "./invoice";
import { emptyInvoice } from "./invoice";

export type InvoiceWithMeta = Invoice & { created_at?: string };

function asStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  return String(v);
}

/** Coerce Mongo / API payloads into canonical client fields */
export function normalizeClientDetails(cd: Invoice["client_details"] | undefined): CompanyDetails {
  const defaults = emptyInvoice().client_details;
  if (!cd || typeof cd !== "object") return { ...defaults };
  const raw = cd as Record<string, unknown>;
  return {
    company_name: asStr(raw.company_name),
    company_email: asStr(raw.company_email),
    contact_name: asStr(raw.contact_name),
    address_line1: asStr(raw.address_line1),
    address_line2: asStr(raw.address_line2),
    address_line3: asStr(raw.address_line3),
    phone: asStr(raw.phone),
    abn: asStr(raw.abn),
  };
}

function contactKey(details: CompanyDetails): string {
  return `${details.company_name.trim().toLowerCase()}\x00${details.contact_name.trim().toLowerCase()}`;
}

export type SavedClientOption = {
  key: string;
  primary: string;
  secondary: string;
  details: CompanyDetails;
};

function createdMs(inv: InvoiceWithMeta): number {
  const raw = inv.created_at;
  if (typeof raw !== "string") return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

/**
 * One row per distinct (company_name, contact_name), keeping the newest saved invoice's address block.
 */
export function savedContactsFromInvoices(invoices: InvoiceWithMeta[]): SavedClientOption[] {
  const byKey = new Map<string, InvoiceWithMeta>();
  const chronological = [...invoices].sort((a, b) => createdMs(a) - createdMs(b));
  for (const inv of chronological) {
    const details = normalizeClientDetails(inv.client_details);
    if (!details.company_name.trim() && !details.contact_name.trim()) continue;
    const key = contactKey(details);
    byKey.set(key, inv);
  }
  const options: SavedClientOption[] = [];
  for (const inv of byKey.values()) {
    const details = normalizeClientDetails(inv.client_details);
    const key = contactKey(details);
    const hasContact = Boolean(details.contact_name.trim());
    const primary = hasContact ? details.contact_name.trim() : details.company_name.trim() || "Unknown client";
    const secondary = hasContact
      ? details.company_name.trim() || "No company name"
      : details.contact_name.trim() || "";
    options.push({ key, primary, secondary, details });
  }
  options.sort((a, b) => {
    const p = a.primary.localeCompare(b.primary, undefined, { sensitivity: "base" });
    if (p !== 0) return p;
    return a.secondary.localeCompare(b.secondary, undefined, { sensitivity: "base" });
  });
  return options;
}
