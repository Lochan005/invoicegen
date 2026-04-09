"use client";

import { useEffect, useId, useRef, useState } from "react";
import { daysInMonth, parseDdMmYyyy, toDdMmYyyy } from "../lib/date";

type Props = {
  label: string;
  value: string; // DD/MM/YYYY
  onChange: (ddmmyyyy: string) => void;
};

const MONTHS: { value: string; label: string }[] = [
  { value: "1", label: "Jan" },
  { value: "2", label: "Feb" },
  { value: "3", label: "Mar" },
  { value: "4", label: "Apr" },
  { value: "5", label: "May" },
  { value: "6", label: "Jun" },
  { value: "7", label: "Jul" },
  { value: "8", label: "Aug" },
  { value: "9", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

type Local = { d: string; m: string; y: string };

export function DateField({ label, value, onChange }: Props) {
  const groupId = useId();
  const labelId = `${groupId}-label`;

  const [local, setLocal] = useState<Local>(() => {
    const p = parseDdMmYyyy(value);
    return p ? { d: String(p.day), m: String(p.month), y: String(p.year) } : { d: "", m: "", y: "" };
  });

  const prevValueRef = useRef(value);

  useEffect(() => {
    const parsed = parseDdMmYyyy(value);
    if (parsed) {
      setLocal({
        d: String(parsed.day),
        m: String(parsed.month),
        y: String(parsed.year),
      });
    }
  }, [value]);

  useEffect(() => {
    if (prevValueRef.current.trim() !== "" && !value.trim()) {
      setLocal({ d: "", m: "", y: "" });
    }
    prevValueRef.current = value;
  }, [value]);

  const yearNow = new Date().getFullYear();
  const years: number[] = [];
  for (let y = yearNow + 10; y >= yearNow - 15; y--) years.push(y);

  const maxDay =
    local.m && local.y
      ? daysInMonth(Number.parseInt(local.m, 10), Number.parseInt(local.y, 10))
      : 31;

  const commit = (next: Local) => {
    if (next.d && next.m && next.y) {
      let d = Number.parseInt(next.d, 10);
      const m = Number.parseInt(next.m, 10);
      const y = Number.parseInt(next.y, 10);
      const dim = daysInMonth(m, y);
      if (d > dim) d = dim;
      const fixed: Local = { d: String(d), m: next.m, y: next.y };
      setLocal(fixed);
      onChange(toDdMmYyyy(d, m, y));
    } else {
      setLocal(next);
      onChange("");
    }
  };

  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <div className="formField">
      <span className="formLabel" id={labelId}>
        {label}
      </span>
      <div className="dateDropdownRow" role="group" aria-labelledby={labelId}>
        <select
          className="dateDropdown"
          aria-label={`${label} — day`}
          value={local.d}
          onChange={(e) => commit({ ...local, d: e.target.value })}
        >
          <option value="">Day</option>
          {dayOptions.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
        <select
          className="dateDropdown"
          aria-label={`${label} — month`}
          value={local.m}
          onChange={(e) => commit({ ...local, m: e.target.value })}
        >
          <option value="">Month</option>
          {MONTHS.map((mo) => (
            <option key={mo.value} value={mo.value}>
              {mo.label}
            </option>
          ))}
        </select>
        <select
          className="dateDropdown"
          aria-label={`${label} — year`}
          value={local.y}
          onChange={(e) => commit({ ...local, y: e.target.value })}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
