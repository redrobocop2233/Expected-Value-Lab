import type { ReactNode } from "react";

export function ConfigPanel({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-24 bg-card border border-accent/20 rounded-xl p-6 space-y-6 glow-ring">
      {children}
    </div>
  );
}

export function RadioField<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-3">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              disabled={disabled}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  disabled,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label}: {format ? format(value) : value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export function SelectField<T extends string | number>({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  disabled?: boolean;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          onChange((match ? match.value : raw) as T);
        }}
        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
