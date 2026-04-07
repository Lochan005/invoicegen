import type { HTMLAttributes } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  multiline?: boolean;
};

export function FormInput({ label, value, onChange, placeholder, type = "text", inputMode, multiline }: Props) {
  return (
    <div className="formField">
      <label className="formLabel">{label}</label>
      {multiline ? (
        <textarea
          className="formInput formTextarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
          rows={3}
        />
      ) : (
        <input
          className="formInput"
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? label}
        />
      )}
    </div>
  );
}
