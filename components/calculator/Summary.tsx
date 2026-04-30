"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/calc/core/types";
import type { SimulationResult } from "@/lib/calc/core/types";

export function Summary({ result, currency }: { result: SimulationResult; currency: Currency }) {
  const winner = result.winner;
  const horizon = result.inputs.horizonYears;
  const delta = Math.abs(result.delta);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>After {horizon} years</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Row label="Buy net worth" value={formatCurrency(result.finalBuyNetWorth, currency)} />
        <Row label="Rent net worth" value={formatCurrency(result.finalRentNetWorth, currency)} />
        <div className="border-t pt-3">
          {winner === "tie" ? (
            <p className="text-sm">Outcomes are roughly equal at this horizon.</p>
          ) : (
            <p className="text-sm">
              <span
                className={
                  winner === "buy"
                    ? "rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900"
                    : "rounded bg-blue-100 px-1.5 py-0.5 text-blue-900"
                }
              >
                {winner === "buy" ? "Buying wins" : "Renting wins"}
              </span>{" "}
              by <strong>{formatCurrency(delta, currency)}</strong>
            </p>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Buy net worth is the accounting view: home equity plus portfolio,{" "}
          <strong>not</strong> reduced by sale-side transaction costs (~6–10% in agent/notary/transfer
          fees if you sold today).
        </p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </div>
  );
}
