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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const NetWorthChart = dynamic(
  () => import("./NetWorthChart").then((m) => m.NetWorthChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);
const MonthlyCostChart = dynamic(
  () => import("./MonthlyCostChart").then((m) => m.MonthlyCostChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full" /> },
);
const SensitivityTable = dynamic(
  () => import("./SensitivityTable").then((m) => m.SensitivityTable),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
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
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">
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
            <CardTitle>Monthly cost composition by year</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyCostChart result={result} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Sensitivity (rate × appreciation)
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="What does sensitivity mean?"
                      className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="font-semibold">What is sensitivity?</div>
                    <div className="mt-1 leading-snug">
                      It re-runs the simulation across a grid of mortgage rates
                      (rows) and home appreciation rates (columns), holding every
                      other input fixed. Each cell shows <strong>buy − rent net
                      worth</strong> at your chosen horizon, so you can see how
                      robust the outcome is to small changes in the two
                      assumptions you control least. Green favours buying, red
                      favours renting; darker colour = larger gap.
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Show grid — pick two inputs and compute on demand
              </summary>
              <div className="mt-4">
                <SensitivityTable inputs={inputs} currency={currency} />
              </div>
            </details>
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
