"use client";

import { useEffect, useMemo, useState } from "react";
import { apiUrl, parseApiError, parseJsonResponse } from "../../lib/api";
import { toInvoiceCreateBody } from "../../lib/apiPayload";
import { BANK, COMPANY, computeTotals, emptyInvoice, type Invoice } from "../../lib/invoice";

export default function PreviewPage() {
  const [invoice, setInvoice] = useState<Invoice>(emptyInvoice());
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const totals = useMemo(() => computeTotals(invoice.line_items), [invoice.line_items]);

  useEffect(() => {
    const raw = localStorage.getItem("invoice:draft");
    if (raw) {
      try {
        setInvoice(JSON.parse(raw) as Invoice);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(apiUrl("/api/pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toInvoiceCreateBody(invoice)),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      const data = await parseJsonResponse<{ pdf_base64: string; filename: string }>(res);
      const byteChars = atob(data.pdf_base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i += 1) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    const clientEmail = invoice.client_details?.company_email;
    if (!clientEmail) {
      alert('No Email — Please add a company email in the "Invoice To" section first.');
      return;
    }
    setEmailing(true);
    try {
      const res = await fetch(apiUrl("/api/email-invoice"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: toInvoiceCreateBody(invoice),
          recipient_email: clientEmail,
          subject: `Invoice #${invoice.invoice_number}`,
          message: `Please find attached Invoice #${invoice.invoice_number}.`,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      alert(`Invoice #${invoice.invoice_number} has been emailed to ${clientEmail}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setEmailing(false);
    }
  };

  const client = invoice.client_details;

  return (
    <div className="previewScreen">
      <header className="previewHeader">
        <h1 className="previewHeaderTitle">Invoice Preview</h1>
      </header>

      <div className="previewScroll">
        <article className="invoicePaper" data-testid="invoice-preview">
          <div className="invoicePaperHeader">
            <div className="invoiceCompanyCol">
              <div className="invoiceCompanyName">{COMPANY.name}</div>
              {COMPANY.address.map((line) => (
                <div key={line} className="invoiceCompanyAddr">
                  {line}
                </div>
              ))}
              <div className="invoiceCompanyAddr">{COMPANY.phone}</div>
              <div className="invoiceCompanyAddr">{COMPANY.email}</div>
              <div className="invoiceCompanyAbn">{COMPANY.abn}</div>
            </div>
          </div>

          <div className="invoiceDivider" />

          <h2 className="taxInvoiceTitle">Tax Invoice</h2>

          <div className="invoiceTwoCol">
            <div className="invoiceColLeft">
              <div className="invoiceToLabel">INVOICE TO</div>
              <div className="invoiceClientName">{client.company_name || "—"}</div>
              {[client.address_line1, client.address_line2, client.address_line3]
                .filter(Boolean)
                .map((l, i) => (
                  <div key={i} className="invoiceClientAddr">
                    {l}
                  </div>
                ))}
              {client.contact_name ? <div className="invoiceClientAddr">{client.contact_name}</div> : null}
              {client.company_email ? <div className="invoiceClientEmail">{client.company_email}</div> : null}
            </div>
            <div className="invoiceColRight">
              <div className="invoiceMetaRow">
                <span className="invoiceMetaLabel">INVOICE</span>
                <span className="invoiceMetaValue">{invoice.invoice_number || "—"}</span>
              </div>
              <div className="invoiceMetaRow">
                <span className="invoiceMetaLabel">DATE</span>
                <span className="invoiceMetaValue">{invoice.invoice_date || "—"}</span>
              </div>
              <div className="invoiceMetaRow">
                <span className="invoiceMetaLabel">DUE DATE</span>
                <span className="invoiceMetaValue">{invoice.due_date || "—"}</span>
              </div>
            </div>
          </div>

          <div className="invoiceTableWrap">
            <table className="invoiceTable">
              <thead>
                <tr>
                  <th className="th thDate">DATE</th>
                  <th className="th thProduct" />
                  <th className="th thDesc">DESCRIPTION</th>
                  <th className="th thGst">GST</th>
                  <th className="th thQty">QTY</th>
                  <th className="th thRate">RATE</th>
                  <th className="th thAmount">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item, idx) => (
                  <tr key={item.id} className="invoiceTr" data-testid={`preview-item-${idx}`}>
                    <td className="td tdDate">{item.service_date || "—"}</td>
                    <td className="td tdProduct tdBold">{item.product || ""}</td>
                    <td className="td tdDesc">{item.description || "—"}</td>
                    <td className="td tdGst">{item.gst_applicable ? "GST" : ""}</td>
                    <td className="td tdQty">{item.quantity}</td>
                    <td className="td tdRate">{item.rate.toFixed(2)}</td>
                    <td className="td tdAmount">{(item.quantity * item.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoiceTotals">
            <div className="invoiceTotalsRow">
              <span className="invoiceTotalsLabel">SUBTOTAL</span>
              <span className="invoiceTotalsValue">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="invoiceTotalsRow">
              <span className="invoiceTotalsLabel">GST TOTAL</span>
              <span className="invoiceTotalsValue">{totals.gst_total.toFixed(2)}</span>
            </div>
            <div className="invoiceTotalsRow invoiceTotalLine">
              <span className="invoiceTotalsLabel">TOTAL</span>
              <span className="invoiceTotalsValue">{totals.total.toFixed(2)}</span>
            </div>
            <div className="invoiceBalanceDueRow">
              <span className="invoiceBalanceDueLabel">BALANCE DUE</span>
              <span className="invoiceBalanceDueValue">A${totals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="invoiceBankBox">
            <div className="invoiceBankTitle">{BANK.title}</div>
            <div className="invoiceBankText">ACCOUNT NAME: {BANK.account_name}</div>
            <div className="invoiceBankText br">&nbsp;</div>
            <div className="invoiceBankText">BSB NO: {BANK.bsb}</div>
            <div className="invoiceBankText">ACCOUNT NO: {BANK.account_no}</div>
          </div>

          <div className="invoiceFooterRow">
            <span className="invoiceFooterText">THANKYOU FOR YOUR BUSINESS</span>
            <span className="invoiceFooterText">Page 1 of 1</span>
          </div>
        </article>
        <div className="previewScrollPad" aria-hidden />
      </div>

      <div className="previewActionBar">
        <button type="button" className="previewActionBtn previewDownloadBtn" onClick={handleDownloadPdf} disabled={downloading}>
          {downloading ? "…" : "⬇ Download PDF"}
        </button>
        <button type="button" className="previewActionBtn previewEmailBtn" onClick={handleEmail} disabled={emailing}>
          {emailing ? "…" : "✉ Email Invoice"}
        </button>
      </div>
    </div>
  );
}
