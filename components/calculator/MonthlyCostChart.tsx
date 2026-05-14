"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationResult, Currency } from "@/lib/calc/core/types";
import { formatCurrency } from "@/lib/utils";

export function MonthlyCostChart({
  result,
  currency,
}: {
  result: SimulationResult;
  currency: Currency;
}) {
  if (result.monthly.length === 0) return null;

  // Bucket the monthly snapshots by year. We display each year as one stacked bar
  // showing the average monthly buyer-cost composition for that year, plus the
  // renter's monthly rent overlaid as a line so the comparison is visible.
  const yearlyAvg: Array<{
    year: number;
    "P&I": number;
    Taxes: number;
    Insurance: number;
    HOA: number;
    Maintenance: number;
    PMI: number;
    Rent: number;
  }> = [];
  const horizon = result.inputs.horizonYears;
  for (let y = 1; y <= horizon; y++) {
    const months = result.monthly.filter((m) => m.year === y);
    if (months.length === 0) continue;
    const n = months.length;
    const sum = months.reduce(
      (acc, m) => {
        acc.pi += m.components.pi;
        acc.propertyTax += m.components.propertyTax;
        acc.insurance += m.components.insurance;
        acc.hoa += m.components.hoa;
        acc.maintenance += m.components.maintenance;
        acc.pmi += m.components.pmi;
        acc.rent += m.monthlyRent;
        return acc;
      },
      { pi: 0, propertyTax: 0, insurance: 0, hoa: 0, maintenance: 0, pmi: 0, rent: 0 },
    );
    yearlyAvg.push({
      year: y,
      "P&I": Math.round(sum.pi / n),
      Taxes: Math.round(sum.propertyTax / n),
      Insurance: Math.round(sum.insurance / n),
      HOA: Math.round(sum.hoa / n),
      Maintenance: Math.round(sum.maintenance / n),
      PMI: Math.round(sum.pmi / n),
      Rent: Math.round(sum.rent / n),
    });
  }

  // For short horizons (e.g. 1–3 years) the composed chart is overkill; fall
  // back to a single stacked bar comparison.
  const Chart = yearlyAvg.length > 1 ? ComposedChart : BarChart;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <Chart data={yearlyAvg} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              currency === "USD" ? `$${v.toFixed(0)}` : `€${v.toFixed(0)}`
            }
          />
          <Tooltip
            formatter={(v: number) => formatCurrency(v, currency)}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar stackId="buy" dataKey="P&I" fill="#0ea5e9" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Taxes" fill="#f59e0b" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Insurance" fill="#a78bfa" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="HOA" fill="#94a3b8" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Maintenance" fill="#10b981" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="PMI" fill="#ef4444" isAnimationActive={false} />
          {yearlyAvg.length > 1 && (
            <Line
              type="monotone"
              dataKey="Rent"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
