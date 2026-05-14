"use client";
import { useState } from "react";
import {
  runSensitivity,
  SENSITIVITY_AXES,
  type SensitivityAxisKey,
  type SensitivityGrid,
} from "@/lib/calc/sensitivity";
import type { CountryInputs, Currency } from "@/lib/calc/core/types";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/utils";

const ALL_AXIS_KEYS: SensitivityAxisKey[] = [
  "mortgageRate",
  "appreciationPct",
  "equityReturnPct",
  "rentInflationPct",
  "horizonYears",
  "downPaymentPct",
  "box3TaxRate",
];

function formatAxisValue(key: SensitivityAxisKey, v: number): string {
  const cfg = SENSITIVITY_AXES[key];
  if (cfg.kind === "year") return `${v} yr`;
  return formatPercent(v);
}

export function SensitivityTable({
  inputs,
  currency,
}: {
  inputs: CountryInputs;
  currency: Currency;
}) {
  const axisKeys = ALL_AXIS_KEYS.filter((k) => {
    const cfg = SENSITIVITY_AXES[k];
    return !cfg.country || cfg.country === inputs.country;
  });
  const [rowAxis, setRowAxis] = useState<SensitivityAxisKey>("mortgageRate");
  const [colAxis, setColAxis] = useState<SensitivityAxisKey>("appreciationPct");
  const [grid, setGrid] = useState<SensitivityGrid | null>(null);
  const [pending, setPending] = useState(false);

  const sameAxis = rowAxis === colAxis;

  const run = () => {
    if (sameAxis) return;
    setPending(true);
    // Let the loading state paint before the synchronous grid build (~80 sims).
    setTimeout(() => {
      const g = runSensitivity(inputs, { rowAxis, colAxis });
      setGrid(g);
      setPending(false);
    }, 0);
  };

  const max = grid
    ? Math.max(...grid.deltas.flat().map((d) => Math.abs(d)), 1)
    : 1;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <AxisPicker
          label="Y axis (rows)"
          value={rowAxis}
          onChange={setRowAxis}
          exclude={colAxis}
          keys={axisKeys}
        />
        <AxisPicker
          label="X axis (columns)"
          value={colAxis}
          onChange={setColAxis}
          exclude={rowAxis}
          keys={axisKeys}
        />
        <Button onClick={run} disabled={sameAxis || pending} size="sm">
          {pending ? "Running…" : grid ? "Re-run" : "Run sensitivity"}
        </Button>
      </div>

      {sameAxis && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Pick two different axes to compare.
        </p>
      )}

      {!grid && !pending && (
        <p className="text-xs text-muted-foreground">
          Click <em>Run sensitivity</em> to compute the grid (~50–80 simulations
          depending on the axes you chose). Not auto-run.
        </p>
      )}

      {grid && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-muted-foreground">
                    {SENSITIVITY_AXES[grid.rowAxis].label} ↓ /{" "}
                    {SENSITIVITY_AXES[grid.colAxis].label} →
                  </th>
                  {grid.colValues.map((c) => (
                    <th
                      key={c}
                      className="px-2 py-1 text-right font-medium tabular-nums"
                    >
                      {formatAxisValue(grid.colAxis, c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.rowValues.map((r, ri) => (
                  <tr key={r}>
                    <td className="px-2 py-1 font-medium tabular-nums text-muted-foreground">
                      {formatAxisValue(grid.rowAxis, r)}
                    </td>
                    {grid.deltas[ri].map((delta, ai) => {
                      const intensity = Math.min(1, Math.abs(delta) / max);
                      const bg =
                        delta > 0
                          ? `rgba(34, 197, 94, ${intensity * 0.4})`
                          : `rgba(239, 68, 68, ${intensity * 0.4})`;
                      return (
                        <td
                          key={ai}
                          className="px-2 py-1 text-right tabular-nums"
                          style={{ backgroundColor: bg }}
                          title={`${SENSITIVITY_AXES[grid.rowAxis].label} ${formatAxisValue(grid.rowAxis, r)} × ${SENSITIVITY_AXES[grid.colAxis].label} ${formatAxisValue(grid.colAxis, grid.colValues[ai])}`}
                        >
                          {formatCurrency(delta, currency)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Each cell shows <strong>buy − rent net worth at year {inputs.horizonYears}</strong>{" "}
            for that combination of {SENSITIVITY_AXES[grid.rowAxis].label.toLowerCase()}{" "}
            and {SENSITIVITY_AXES[grid.colAxis].label.toLowerCase()}, holding all
            other inputs fixed. Green favours buy, red favours rent.
          </p>
        </>
      )}
    </div>
  );
}

function AxisPicker({
  label,
  value,
  onChange,
  exclude,
  keys,
}: {
  label: string;
  value: SensitivityAxisKey;
  onChange: (v: SensitivityAxisKey) => void;
  exclude: SensitivityAxisKey;
  keys: SensitivityAxisKey[];
}) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SensitivityAxisKey)}
      >
        {keys.map((k) => (
          <option key={k} value={k} disabled={k === exclude}>
            {SENSITIVITY_AXES[k].label}
          </option>
        ))}
      </Select>
    </div>
  );
}
