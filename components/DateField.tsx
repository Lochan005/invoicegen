import { fromHTMLDate, toHTMLDate } from "../lib/date";

type Props = {
  label: string;
  value: string; // DD/MM/YYYY
  onChange: (ddmmyyyy: string) => void;
};

export function DateField({ label, value, onChange }: Props) {
  return (
    <div className="formField">
      <label className="formLabel">{label}</label>
      <div className="dateInputShell">
        <input
          className="formInput formInputDate"
          type="date"
          value={toHTMLDate(value)}
          onChange={(e) => {
            const v = e.target.value;
            if (v) onChange(fromHTMLDate(v));
          }}
        />
      </div>
    </div>
  );
}
