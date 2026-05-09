"use client";
import { useMemo } from "react";
import { runSensitivity } from "@/lib/calc/sensitivity";
import type { CountryInputs, Currency } from "@/lib/calc/core/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function SensitivityTable({
  inputs,
  currency,
}: {
  inputs: CountryInputs;
  currency: Currency;
}) {
  const grid = useMemo(() => runSensitivity(inputs), [inputs]);
  const max = useMemo(() => {
    const flat = grid.deltas.flat().map((d) => Math.abs(d));
    return Math.max(...flat, 1);
  }, [grid.deltas]);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-muted-foreground">
                rate ↓ / appr. →
              </th>
              {grid.appreciations.map((a) => (
                <th
                  key={a}
                  className="px-2 py-1 text-right font-medium tabular-nums"
                >
                  {formatPercent(a)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.rates.map((r, ri) => (
              <tr key={r}>
                <td className="px-2 py-1 font-medium tabular-nums text-muted-foreground">
                  {formatPercent(r)}
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
                      title={`mortgage rate ${formatPercent(r)} × appreciation ${formatPercent(grid.appreciations[ai])}`}
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
        for that combination of mortgage rate and home appreciation, holding all other
        inputs fixed. Green favours buy, red favours rent.
      </p>
    </div>
  );
}
