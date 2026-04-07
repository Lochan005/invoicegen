"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, parseApiError, parseJsonResponse } from "../../lib/api";
import type { Invoice } from "../../lib/invoice";

export default function SavedPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/invoices"));
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await parseJsonResponse<unknown>(res);
      setInvoices(Array.isArray(data) ? (data as Invoice[]) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const openInvoice = (inv: Invoice) => {
    localStorage.setItem("invoice:draft", JSON.stringify(inv));
    if (inv.id) localStorage.setItem("invoice:activeId", inv.id);
    router.push("/preview");
  };

  const deleteInvoice = async (inv: Invoice) => {
    if (!inv.id) return;
    if (!window.confirm(`Delete invoice #${inv.invoice_number}?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/invoices/${inv.id}`), { method: "DELETE" });
      if (!res.ok) throw new Error(await parseApiError(res));
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="savedPage">
      <div className="savedPageHeader">
        <div>
          <h1 className="pageTitle" style={{ marginBottom: 2 }}>
            Saved Invoices
          </h1>
          <p className="pageSubtitle" style={{ margin: 0 }}>
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          className="savedNewBtn"
          onClick={() => {
            localStorage.removeItem("invoice:draft");
            localStorage.removeItem("invoice:activeId");
            router.push("/create");
          }}
        >
          + New
        </button>
      </div>

      {error ? (
        <div className="card" style={{ background: "#fef3c7", borderColor: "#fcd34d", color: "#92400e" }}>
          <strong>Could not load invoices</strong>
          <p style={{ margin: "8px 0 0", fontSize: 13 }}>{error}</p>
          <button type="button" className="addLineBtn" style={{ marginTop: 12 }} onClick={() => fetchInvoices()}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="pageSubtitle">Loading…</p>
      ) : invoices.length === 0 && !error ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p className="pageTitle" style={{ fontSize: 18 }}>
            No Invoices Yet
          </p>
          <p className="pageSubtitle">Create your first invoice to get started</p>
          <button
            type="button"
            className="primaryBtn"
            style={{ marginTop: 16 }}
            onClick={() => {
              localStorage.removeItem("invoice:draft");
              localStorage.removeItem("invoice:activeId");
              router.push("/create");
            }}
          >
            Create Invoice
          </button>
        </div>
      ) : (
        invoices.map((inv, index) => (
          <div key={inv.id || `inv-${index}`} className="savedCard">
            <button type="button" className="savedRowMain" onClick={() => openInvoice(inv)}>
              <div className="savedIcon">#{inv.invoice_number || "?"}</div>
              <div className="savedInfo">
                <div className="savedTitle">Invoice #{inv.invoice_number}</div>
                <div className="savedSub">
                  {inv.client_details?.company_name || "No client"} · A${(inv.total ?? 0).toFixed(2)}
                </div>
                <div className="savedDate">{inv.invoice_date || "No date"}</div>
              </div>
            </button>
            <button type="button" className="savedDeleteBtn" onClick={() => deleteInvoice(inv)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}
