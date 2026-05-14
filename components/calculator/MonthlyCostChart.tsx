"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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

  // Bucket the monthly snapshots by year. Each year gets two side-by-side
  // bars: the buyer's stacked cost composition and the renter's rent (both
  // 12-month averages for that year).
  const yearlyAvg: Array<{
    year: number;
    Interest: number;
    Principal: number;
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
        acc.interest += m.components.interest;
        acc.principal += m.components.principal;
        acc.propertyTax += m.components.propertyTax;
        acc.insurance += m.components.insurance;
        acc.hoa += m.components.hoa;
        acc.maintenance += m.components.maintenance;
        acc.pmi += m.components.pmi;
        acc.rent += m.monthlyRent;
        return acc;
      },
      {
        interest: 0,
        principal: 0,
        propertyTax: 0,
        insurance: 0,
        hoa: 0,
        maintenance: 0,
        pmi: 0,
        rent: 0,
      },
    );
    yearlyAvg.push({
      year: y,
      Interest: Math.round(sum.interest / n),
      Principal: Math.round(sum.principal / n),
      Taxes: Math.round(sum.propertyTax / n),
      Insurance: Math.round(sum.insurance / n),
      HOA: Math.round(sum.hoa / n),
      Maintenance: Math.round(sum.maintenance / n),
      PMI: Math.round(sum.pmi / n),
      Rent: Math.round(sum.rent / n),
    });
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <BarChart data={yearlyAvg} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
          {/* Buyer stack: pure costs (warm) at bottom, principal (equity-building) on top */}
          <Bar stackId="buy" dataKey="Interest" fill="#f97316" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Taxes" fill="#f59e0b" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Insurance" fill="#a78bfa" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="HOA" fill="#94a3b8" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Maintenance" fill="#fbbf24" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="PMI" fill="#ef4444" isAnimationActive={false} />
          <Bar stackId="buy" dataKey="Principal" fill="#10b981" isAnimationActive={false} />
          <Bar stackId="rent" dataKey="Rent" fill="#3b82f6" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
