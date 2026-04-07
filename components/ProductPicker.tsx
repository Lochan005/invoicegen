"use client";

import { useState } from "react";
import { PRODUCTS } from "../lib/products";

type Props = {
  label: string;
  value: string;
  onSelect: (v: string) => void;
};

export function ProductPicker({ label, value, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="formField">
      <span className="formLabel">{label}</span>
      <button type="button" className="productPickerBtn" onClick={() => setOpen(true)}>
        <span className={value ? "productPickerValue" : "productPickerPlaceholder"}>
          {value || "Select product / service"}
        </span>
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div className="modalOverlay" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modalSheet"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <strong>Select Product / Service</strong>
              <button type="button" className="modalClose" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <ul className="productList">
              {PRODUCTS.map((p) => (
                <li key={p}>
                  <button
                    type="button"
                    className={`productOption ${value === p ? "productOptionSelected" : ""}`}
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                    }}
                  >
                    {p}
                    {value === p ? " ✓" : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
