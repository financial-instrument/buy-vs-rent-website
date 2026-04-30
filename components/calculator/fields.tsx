"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  prefix,
  hint,
}: NumberFieldProps) {
  return (
    <div className="grid gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <Input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}

interface PercentFieldProps {
  label: string;
  value: number; // stored as fraction (0.07)
  onChange: (v: number) => void;
  step?: number; // in percent points
  min?: number;
  max?: number;
  hint?: string;
}

export function PercentField({
  label,
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

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  formatter?: (v: number) => string;
}

export function SliderField({
  label,
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
        <Label className="text-xs text-muted-foreground">{label}</Label>
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

interface SwitchFieldProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}

export function SwitchField({ label, checked, onChange, hint }: SwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="grid gap-0.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  className?: string;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SelectFieldProps<T>) {
  return (
    <div className={cn("grid gap-1", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
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
