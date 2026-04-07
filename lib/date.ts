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

export function addOneMonth(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  date.setMonth(date.getMonth() + 1);
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}
