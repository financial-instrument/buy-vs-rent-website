"use client";
import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { runSimulation } from "@/lib/calc";
import { decode } from "@/lib/url/decode";
import { itDefaults, nlDefaults, usDefaults } from "@/lib/calc";
import type { Country, Currency } from "@/lib/calc/core/types";
import { Inputs } from "./Inputs";
import { Summary } from "./Summary";
import { ShareLink } from "./ShareLink";
import { AdSense } from "@/components/ads/AdSense";
import { useCalcStore } from "./store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const NetWorthChart = dynamic(
  () => import("./NetWorthChart").then((m) => m.NetWorthChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);
const MonthlyCostChart = dynamic(
  () => import("./MonthlyCostChart").then((m) => m.MonthlyCostChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);

const FLAGS: Record<Country, string> = { us: "🇺🇸", nl: "🇳🇱", it: "🇮🇹" };
const NAMES: Record<Country, string> = {
  us: "the United States",
  nl: "the Netherlands",
  it: "Italy",
};

export function Calculator({ country, currency }: { country: Country; currency: Currency }) {
  const searchParams = useSearchParams();
  const inputs = useCalcStore((s) => s.inputs);
  const setInputs = useCalcStore((s) => s.setInputs);

  // Initialize from URL or defaults; runs whenever the country changes.
  useEffect(() => {
    let initial;
    try {
      initial = decode(country, new URLSearchParams(searchParams.toString()));
    } catch {
      initial = country === "us" ? usDefaults() : country === "nl" ? nlDefaults() : itDefaults();
    }
    setInputs(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const result = useMemo(() => (inputs ? runSimulation(inputs) : null), [inputs]);

  if (!inputs || !result) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="grid gap-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {FLAGS[country]} Rent vs Buy in {NAMES[country]}
          </h1>
          <ShareLink inputs={inputs} />
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Inputs />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net worth over time</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorthChart result={result} currency={currency} />
          </CardContent>
        </Card>

        <AdSense className="my-2" />

        <Card>
          <CardHeader>
            <CardTitle>Monthly cost composition (mid-horizon)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyCostChart result={result} currency={currency} />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          See <a className="underline" href={`/methodology#${country}`}>methodology</a>{" "}
          for the per-country tax assumptions and formulas.
        </p>
      </div>

      <aside>
        <Summary result={result} currency={currency} />
      </aside>
    </div>
  );
}
