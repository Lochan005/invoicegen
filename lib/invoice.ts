import { newId } from "./newId";

export type LineItem = {
  id: string;
  service_date: string;
  product: string;
  description: string;
  gst_applicable: boolean;
  quantity: number;
  rate: number;
};

export type CompanyDetails = {
  company_name: string;
  company_email: string;
  contact_name: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  phone: string;
  abn: string;
};

export type BankDetails = {
  account_name: string;
  bsb: string;
  account_number: string;
};

export type Invoice = {
  id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  company_details: CompanyDetails;
  client_details: CompanyDetails;
  bank_details: BankDetails;
  line_items: LineItem[];
  subtotal: number;
  gst_total: number;
  total: number;
  notes: string;
};

export const COMPANY = {
  name: "The trustee for SAITECH TRADING TRUST",
  address: ["33 LOWANNAWAY", "ARMADALE WA  6112"],
  phone: "+61 470530451",
  email: "shiva.prasad1947@gmail.com",
  abn: "ABN 39315636679",
};

export const BANK = {
  title: "BANK DETAILS;",
  account_name: "SAITECH ENGINEERING PTY LTD",
  bsb: "086006",
  account_no: "925720296",
};

export const emptyInvoice = (): Invoice => ({
  invoice_number: "",
  invoice_date: "",
  due_date: "",
  company_details: {
    company_name: "",
    company_email: "",
    contact_name: "",
    address_line1: "",
    address_line2: "",
    address_line3: "",
    phone: "",
    abn: "",
  },
  client_details: {
    company_name: "",
    company_email: "",
    contact_name: "",
    address_line1: "",
    address_line2: "",
    address_line3: "",
    phone: "",
    abn: "",
  },
  bank_details: { account_name: "", bsb: "", account_number: "" },
  line_items: [
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
  subtotal: 0,
  gst_total: 0,
  total: 0,
  notes: "",
});

export function computeTotals(items: LineItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const gst_total = items.reduce(
    (sum, i) => sum + (i.gst_applicable ? i.quantity * i.rate * 0.1 : 0),
    0
  );
  return {
    subtotal: Number(subtotal.toFixed(2)),
    gst_total: Number(gst_total.toFixed(2)),
    total: Number((subtotal + gst_total).toFixed(2)),
  };
}
