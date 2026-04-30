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
  // Pick a snapshot at horizon midpoint.
  const idx = Math.floor(result.monthly.length / 2);
  const m = result.monthly[idx];
  if (!m) return null;
  const data = [
    {
      label: "Buy",
      "P&I": Math.round(m.components.pi),
      Taxes: Math.round(m.components.propertyTax),
      Insurance: Math.round(m.components.insurance),
      HOA: Math.round(m.components.hoa),
      Maintenance: Math.round(m.components.maintenance),
      PMI: Math.round(m.components.pmi),
    },
    { label: "Rent", Rent: Math.round(m.monthlyRent) },
  ];
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              currency === "USD" ? `$${v.toFixed(0)}` : `€${v.toFixed(0)}`
            }
          />
          <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar stackId="a" dataKey="P&I" fill="#0ea5e9" />
          <Bar stackId="a" dataKey="Taxes" fill="#f59e0b" />
          <Bar stackId="a" dataKey="Insurance" fill="#a78bfa" />
          <Bar stackId="a" dataKey="HOA" fill="#94a3b8" />
          <Bar stackId="a" dataKey="Maintenance" fill="#10b981" />
          <Bar stackId="a" dataKey="PMI" fill="#ef4444" />
          <Bar stackId="a" dataKey="Rent" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
