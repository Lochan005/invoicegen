import type { Invoice } from "./invoice";

/** Body shape expected by FastAPI `InvoiceCreate` (no id / computed totals). */
export function toInvoiceCreateBody(inv: Invoice) {
  return {
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    company_details: inv.company_details,
    client_details: inv.client_details,
    bank_details: inv.bank_details,
    line_items: inv.line_items,
    notes: inv.notes ?? "",
  };
}
