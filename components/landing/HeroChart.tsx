"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Pre-baked example: ~Dutch 10-year scenario, €450k home, 10% down,
// 4.5% rate, 3% appreciation, 7% equity / 4% bond, 70/30 split.
// We don't run the engine on the landing page — the curve below is a
// hand-tuned illustration meant only to communicate the visual style.
const DATA = [
  { year: 0, Buy: 45000, Rent: 70000 },
  { year: 1, Buy: 60000, Rent: 79000 },
  { year: 2, Buy: 78000, Rent: 88500 },
  { year: 3, Buy: 99000, Rent: 99000 },
  { year: 4, Buy: 122000, Rent: 110000 },
  { year: 5, Buy: 147000, Rent: 122500 },
  { year: 6, Buy: 174000, Rent: 136000 },
  { year: 7, Buy: 204000, Rent: 151000 },
  { year: 8, Buy: 236000, Rent: 167500 },
  { year: 9, Buy: 271000, Rent: 185500 },
  { year: 10, Buy: 309000, Rent: 205000 },
];

export function HeroChart() {
  return (
    <div className="h-[260px] w-full" aria-label="Illustrative net-worth comparison">
      <ResponsiveContainer>
        <AreaChart data={DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="buyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            label={{ value: "year", position: "insideBottom", offset: -2, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={42}
          />
          <Tooltip
            formatter={(v: number) => `${Math.round(v / 1000)}k`}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="Buy"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#buyFill)"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="Rent"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#rentFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
