"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Currency } from "@/lib/calc/core/types";
import type { SimulationResult } from "@/lib/calc/core/types";

export function Summary({ result, currency }: { result: SimulationResult; currency: Currency }) {
  const winner = result.winner;
  const horizon = result.inputs.horizonYears;
  const delta = Math.abs(result.delta);
  const closingTotal = result.yearZero.closingCostsPenalty;

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
        {closingTotal > 0 && (
          <p className="rounded border border-amber-200 bg-amber-50 p-2 text-[11px] leading-snug text-amber-900">
            <strong>How closing costs show up:</strong> Buy NW is the accounting
            view (home value − loan + portfolio); the{" "}
            {formatCurrency(closingTotal, currency)} you spend at closing
            (overbid, notary, fees, transfer tax) is{" "}
            <em>not</em> subtracted from Buy NW directly. Instead it appears as
            a t=0 head-start the renter invests — so raising closing costs
            always shifts the comparison toward renting, never toward buying.
          </p>
        )}
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
