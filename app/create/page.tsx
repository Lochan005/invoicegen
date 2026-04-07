"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DateField } from "../../components/DateField";
import { FormInput } from "../../components/FormInput";
import { FormSection } from "../../components/FormSection";
import { ProductPicker } from "../../components/ProductPicker";
import { apiUrl, parseApiError, parseJsonResponse } from "../../lib/api";
import { toInvoiceCreateBody } from "../../lib/apiPayload";
import { addOneMonth } from "../../lib/date";
import { computeTotals, COMPANY, emptyInvoice, type Invoice, type LineItem } from "../../lib/invoice";
import { newId } from "../../lib/newId";

export default function CreatePage() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice>(emptyInvoice());
  const [saving, setSaving] = useState(false);
  const totals = useMemo(() => computeTotals(invoice.line_items), [invoice.line_items]);

  useEffect(() => {
    const raw = localStorage.getItem("invoice:draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Invoice;
        if (parsed?.line_items?.length) setInvoice(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    if (invoice.id || invoice.invoice_number) return;
    let cancelled = false;
    fetch(apiUrl("/api/invoices/next-number"))
      .then(async (res) => {
        if (!res.ok) throw new Error(await parseApiError(res));
        return parseJsonResponse<{ next_number?: string }>(res);
      })
      .then((data) => {
        if (cancelled || !data?.next_number) return;
        setInvoice((prev) => ({ ...prev, invoice_number: data.next_number }));
      })
      .catch(() => {
        /* offline / API down */
      });
    return () => {
      cancelled = true;
    };
  }, [invoice.id, invoice.invoice_number]);

  const updateClient = useCallback((field: keyof Invoice["client_details"], value: string) => {
    setInvoice((prev) => ({
      ...prev,
      client_details: { ...prev.client_details, [field]: value },
    }));
  }, []);

  const updateField = useCallback((field: keyof Invoice, value: string) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleInvoiceDateChange = useCallback(
    (dateStr: string) => {
      setInvoice((prev) => ({
        ...prev,
        invoice_date: dateStr,
        due_date: dateStr ? addOneMonth(dateStr) : "",
      }));
    },
    []
  );

  const addLineItem = useCallback(() => {
    setInvoice((prev) => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          id: newId(),
          service_date: "",
          product: "",
          description: "",
          gst_applicable: true,
          quantity: 1,
          rate: 0,
        },
      ],
    }));
  }, []);

  const removeLineItem = useCallback((id: string) => {
    setInvoice((prev) => ({
      ...prev,
      line_items: prev.line_items.length > 1 ? prev.line_items.filter((item) => item.id !== id) : prev.line_items,
    }));
  }, []);

  const updateLineItem = useCallback((id: string, field: keyof LineItem, value: string | number | boolean) => {
    setInvoice((prev) => ({
      ...prev,
      line_items: prev.line_items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }, []);

  const saveInvoice = async () => {
    if (!invoice.invoice_number.trim()) {
      alert("Please enter an invoice number");
      return;
    }
    setSaving(true);
    try {
      const body = toInvoiceCreateBody(invoice);
      const url = invoice.id ? apiUrl(`/api/invoices/${invoice.id}`) : apiUrl("/api/invoices");
      const method = invoice.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const saved = await parseJsonResponse<Invoice>(res);
      localStorage.setItem("invoice:draft", JSON.stringify(saved));
      if (saved.id) localStorage.setItem("invoice:activeId", saved.id);
      const goPreview = window.confirm("Invoice saved. Open preview?");
      if (goPreview) router.push("/preview");
      else setInvoice(saved);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="createPage">
      <header className="pageHeader">
        <h1 className="pageTitle">Create Invoice</h1>
        <p className="pageSubtitle">Fill in the details below</p>
        <button
          type="button"
          className="textLinkBtn"
          onClick={() => {
            localStorage.removeItem("invoice:draft");
            localStorage.removeItem("invoice:activeId");
            setInvoice(emptyInvoice());
          }}
        >
          Start fresh
        </button>
      </header>

      <div className="companyBanner" data-testid="company-banner">
        <div className="companyBannerTitle">{COMPANY.name}</div>
        <div className="companyBannerSub">
          {COMPANY.address[0]}, {COMPANY.address[1].replace(/\s+/g, " ").trim()}
        </div>
      </div>

      <FormSection title="Invoice To">
        <FormInput
          label="Company Name"
          value={invoice.client_details.company_name}
          onChange={(v) => updateClient("company_name", v)}
        />
        <FormInput
          label="Contact Name"
          value={invoice.client_details.contact_name}
          onChange={(v) => updateClient("contact_name", v)}
        />
        <FormInput
          label="Company Email"
          type="email"
          value={invoice.client_details.company_email}
          onChange={(v) => updateClient("company_email", v)}
        />
        <FormInput
          label="Address Line 1"
          value={invoice.client_details.address_line1}
          onChange={(v) => updateClient("address_line1", v)}
        />
        <FormInput
          label="Address Line 2"
          value={invoice.client_details.address_line2}
          onChange={(v) => updateClient("address_line2", v)}
        />
        <FormInput
          label="Address Line 3"
          value={invoice.client_details.address_line3}
          onChange={(v) => updateClient("address_line3", v)}
        />
      </FormSection>

      <FormSection title="Invoice Details">
        <FormInput
          label="Invoice Number"
          value={invoice.invoice_number}
          onChange={(v) => updateField("invoice_number", v)}
          placeholder="Auto-generated"
        />
        <DateField label="Invoice Date" value={invoice.invoice_date} onChange={handleInvoiceDateChange} />
        <DateField
          label="Due Date (auto: +1 month)"
          value={invoice.due_date}
          onChange={(v) => updateField("due_date", v)}
        />
      </FormSection>

      <FormSection title="Line Items">
        {invoice.line_items.map((item, idx) => (
          <div key={item.id} className="lineItemCard">
            <div className="lineItemHeader">
              <span className="lineItemTitle">Item #{idx + 1}</span>
              {invoice.line_items.length > 1 ? (
                <button type="button" className="lineItemRemove" onClick={() => removeLineItem(item.id)}>
                  Remove
                </button>
              ) : null}
            </div>
            <DateField
              label="Service Date"
              value={item.service_date}
              onChange={(v) => updateLineItem(item.id, "service_date", v)}
            />
            <ProductPicker label="Product / Service" value={item.product} onSelect={(v) => updateLineItem(item.id, "product", v)} />
            <FormInput
              label="Description"
              value={item.description}
              onChange={(v) => updateLineItem(item.id, "description", v)}
              multiline
            />
            <div className="gstRow">
              <span className="gstLabel">GST (10%)</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={item.gst_applicable}
                  onChange={(e) => updateLineItem(item.id, "gst_applicable", e.target.checked)}
                />
                <span className="switchSlider" />
              </label>
            </div>
            <div className="qtyRateRow">
              <FormInput
                label="Qty"
                value={String(item.quantity)}
                onChange={(v) => updateLineItem(item.id, "quantity", parseFloat(v) || 0)}
                inputMode="decimal"
              />
              <FormInput
                label="Rate"
                value={String(item.rate)}
                onChange={(v) => updateLineItem(item.id, "rate", parseFloat(v) || 0)}
                inputMode="decimal"
              />
              <div className="amountBox">
                <span className="amountLabel">Amount</span>
                <span className="amountValue">${(item.quantity * item.rate).toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="addLineBtn" onClick={addLineItem}>
          + Add Item
        </button>
      </FormSection>

      <div className="totalsCard">
        <div className="totalRow">
          <span>Subtotal</span>
          <span className="totalValue">${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="totalRow">
          <span>GST (10%)</span>
          <span className="totalValue">${totals.gst_total.toFixed(2)}</span>
        </div>
        <div className="totalRow balanceRow">
          <span className="balanceLabel">Balance Due</span>
          <span className="balanceValue">A${totals.total.toFixed(2)}</span>
        </div>
      </div>

      <button type="button" className="primaryBtn saveBtn" onClick={saveInvoice} disabled={saving}>
        {saving ? "Saving..." : "Save Invoice"}
      </button>

      <div className="bottomSpacer" />
    </div>
  );
}
