"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SimulationResult, Currency } from "@/lib/calc/core/types";
import { formatCurrency } from "@/lib/utils";

export function NetWorthChart({
  result,
  currency,
}: {
  result: SimulationResult;
  currency: Currency;
}) {
  const data = result.yearly.map((y) => ({
    year: y.year,
    Buy: Math.round(y.buyNetWorth),
    Rent: Math.round(y.rentNetWorth),
  }));
  return (
    <div className="h-[320px] w-full" data-testid="net-worth-chart">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              currency === "USD"
                ? `$${(v / 1000).toFixed(0)}k`
                : `€${(v / 1000).toFixed(0)}k`
            }
          />
          <Tooltip
            formatter={(v: number) => formatCurrency(v, currency)}
            labelFormatter={(l) => `Year ${l}`}
          />
          <Line
            type="monotone"
            dataKey="Buy"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="Rent"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
