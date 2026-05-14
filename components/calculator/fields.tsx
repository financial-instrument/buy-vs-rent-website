"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { InfoLabel } from "./InfoLabel";

interface CommonProps {
  label: string;
  glossaryId?: string;
  hint?: string;
}

interface NumberFieldProps extends CommonProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
}

export function NumberField({
  label,
  glossaryId,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  prefix,
  hint,
}: NumberFieldProps) {
  // Local draft string lets the user clear all digits (incl. empty/partial like ".") without
  // losing focus. We commit the numeric to the parent whenever the draft parses cleanly; on
  // blur, the draft drops and the input snaps back to the parent's value.
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft !== null ? draft : Number.isFinite(value) ? String(value) : "";
  return (
    <div className="grid gap-1">
      <InfoLabel text={label} glossaryId={glossaryId} />
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          value={display}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            const v = parseFloat(raw);
            if (!Number.isNaN(v)) onChange(v);
          }}
          onBlur={() => setDraft(null)}
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      {hint && (
        <span className="text-[11px] leading-tight text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

interface PercentFieldProps extends CommonProps {
  value: number; // stored as fraction (0.07)
  onChange: (v: number) => void;
  step?: number; // in percent points
  min?: number;
  max?: number;
}

export function PercentField({
  label,
  glossaryId,
  value,
  onChange,
  step = 0.1,
  min = 0,
  max = 100,
  hint,
}: PercentFieldProps) {
  const display = +(value * 100).toFixed(4);
  return (
    <NumberField
      label={label}
      glossaryId={glossaryId}
      value={display}
      onChange={(v) => onChange(v / 100)}
      step={step}
      min={min}
      max={max}
      suffix="%"
      hint={hint}
    />
  );
}

interface SliderFieldProps extends CommonProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  formatter?: (v: number) => string;
}

export function SliderField({
  label,
  glossaryId,
  value,
  onChange,
  min,
  max,
  step,
  formatter,
}: SliderFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <InfoLabel text={label} glossaryId={glossaryId} />
        <span className="text-xs font-medium">{formatter ? formatter(value) : value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
    </div>
  );
}

interface SwitchFieldProps extends CommonProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function SwitchField({ label, glossaryId, checked, onChange, hint }: SwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid gap-0.5">
        <InfoLabel text={label} glossaryId={glossaryId} />
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface SelectFieldProps<T extends string> extends CommonProps {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  className?: string;
}

export function SelectField<T extends string>({
  label,
  glossaryId,
  value,
  options,
  onChange,
  className,
}: SelectFieldProps<T>) {
  return (
    <div className={cn("grid gap-1", className)}>
      <InfoLabel text={label} glossaryId={glossaryId} />
      <Select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

// Re-export raw Label for callers that need it.
export { Label };
