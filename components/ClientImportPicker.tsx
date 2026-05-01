"use client";

import { useCallback, useState } from "react";
import { apiUrl, parseApiError, parseJsonResponse } from "../lib/api";
import type { CompanyDetails } from "../lib/invoice";
import type { InvoiceWithMeta, SavedClientOption } from "../lib/savedClients";
import { savedContactsFromInvoices } from "../lib/savedClients";

type Props = { onApply: (client: CompanyDetails) => void };

async function fetchSavedInvoices(): Promise<InvoiceWithMeta[]> {
  const res = await fetch(apiUrl("/invoice-api/invoices"));
  if (!res.ok) throw new Error(await parseApiError(res));
  const data = await parseJsonResponse<unknown>(res);
  if (!Array.isArray(data)) throw new Error("Unexpected response loading saved invoices.");
  return data as InvoiceWithMeta[];
}

export function ClientImportPicker({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<SavedClientOption[]>([]);

  const openSheet = useCallback(() => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setOptions([]);
    void fetchSavedInvoices()
      .then((list) => {
        setOptions(savedContactsFromInvoices(list));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <button type="button" className="importClientBtn" onClick={openSheet}>
        Import…
      </button>
      {open ? (
        <div className="modalOverlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modalSheet modalSheetScroll"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-import-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <strong id="client-import-title">Import from saved</strong>
              <button type="button" className="modalClose" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            {loading ? <p className="importPickerStatus">Loading saved invoices…</p> : null}
            {!loading && error ? <p className="importPickerError">{error}</p> : null}
            {!loading && !error && options.length === 0 ? (
              <p className="importPickerStatus">No saved client details yet.</p>
            ) : null}
            {!loading && !error && options.length > 0 ? (
              <ul className="productList">
                {options.map((row) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      className="productOption clientImportOption"
                      onClick={() => {
                        onApply({ ...row.details });
                        setOpen(false);
                      }}
                    >
                      <span className="clientImportPrimary">{row.primary}</span>
                      {row.secondary ? (
                        <span className="clientImportSecondary">{row.secondary}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
