"use client";

import { useEffect, useState } from "react";

const DECIMAL_INPUT_RE = /^\d*\.?\d*$/;

type Props = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

function formatCommitted(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(n);
}

export function DecimalFormInput({ label, value, onValueChange }: Props) {
  const [text, setText] = useState(() => formatCommitted(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatCommitted(value));
  }, [value, focused]);

  return (
    <div className="formField">
      <label className="formLabel">{label}</label>
      <input
        className="formInput"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={text}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          const n = parseFloat(text);
          const resolved = Number.isFinite(n) ? n : 0;
          onValueChange(resolved);
          setText(formatCommitted(resolved));
        }}
        onChange={(e) => {
          const v = e.target.value;
          if (v !== "" && !DECIMAL_INPUT_RE.test(v)) return;
          setText(v);
          if (v === "" || v === ".") return;
          const n = parseFloat(v);
          if (Number.isFinite(n)) onValueChange(n);
        }}
      />
    </div>
  );
}
