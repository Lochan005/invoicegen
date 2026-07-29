"use client";

import { useState } from "react";
import { PRODUCTS } from "../lib/products";

const ADD_PRODUCT_LABEL = "Add product";

function isCatalogProduct(name: string): boolean {
  return (PRODUCTS as readonly string[]).includes(name);
}

type Props = {
  label: string;
  value: string;
  onSelect: (v: string) => void;
};

export function ProductPicker({ label, value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");

  const close = () => {
    setOpen(false);
    setCustomMode(false);
    setCustomName("");
  };

  const openPicker = () => {
    setCustomMode(false);
    setCustomName("");
    setOpen(true);
  };

  const startCustom = () => {
    setCustomName(value && !isCatalogProduct(value) ? value : "");
    setCustomMode(true);
  };

  const submitCustom = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onSelect(trimmed);
    close();
  };

  return (
    <div className="formField">
      <span className="formLabel">{label}</span>
      <button type="button" className="productPickerBtn" onClick={openPicker}>
        <span className={value ? "productPickerValue" : "productPickerPlaceholder"}>
          {value || "Select product / service"}
        </span>
        <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div className="modalOverlay" role="presentation" onClick={close}>
          <div
            className="modalSheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-picker-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modalHeader">
              <strong id="product-picker-title">
                {customMode ? "Add product / service" : "Select Product / Service"}
              </strong>
              <button type="button" className="modalClose" onClick={close} aria-label="Close">
                ×
              </button>
            </div>
            {customMode ? (
              <div className="productCustomForm">
                <label className="formLabel" htmlFor="product-custom-name">
                  Product name
                </label>
                <input
                  id="product-custom-name"
                  className="formInput"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter product or service name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitCustom();
                    }
                  }}
                />
                <div className="productCustomActions">
                  <button type="button" className="productCustomBackBtn" onClick={() => setCustomMode(false)}>
                    Back
                  </button>
                  <button
                    type="button"
                    className="productCustomAddBtn"
                    onClick={submitCustom}
                    disabled={!customName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <ul className="productList">
                {PRODUCTS.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      className={`productOption ${value === p ? "productOptionSelected" : ""}`}
                      onClick={() => {
                        onSelect(p);
                        close();
                      }}
                    >
                      {p}
                      {value === p ? " ✓" : null}
                    </button>
                  </li>
                ))}
                <li>
                  <button type="button" className="productOption productOptionAdd" onClick={startCustom}>
                    {ADD_PRODUCT_LABEL}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
