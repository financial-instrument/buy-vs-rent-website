import { runSimulation } from "./index";
import type { Country, CountryInputs } from "./core/types";

// Sensitivity grids let the user vary any two inputs against each other and
// see how the buy − rent delta changes. Universal axes apply to every country;
// country-scoped axes (Box 3 tax rate, etc.) only show up for that country.

export type SensitivityAxisKey =
  | "mortgageRate"
  | "appreciationPct"
  | "equityReturnPct"
  | "rentInflationPct"
  | "horizonYears"
  | "downPaymentPct"
  | "box3TaxRate";

export interface SensitivityAxis {
  key: SensitivityAxisKey;
  label: string;
  // "percent" → display as 6.5%, "year" → display as "10 yr".
  kind: "percent" | "year";
  // Default ± range around the base value and step between cells.
  range: number;
  step: number;
  integer?: boolean;
  // If set, the axis is only available for that country.
  country?: Country;
}

export const SENSITIVITY_AXES: Record<SensitivityAxisKey, SensitivityAxis> = {
  mortgageRate: {
    key: "mortgageRate",
    label: "Mortgage rate",
    kind: "percent",
    range: 0.02,
    step: 0.005,
  },
  appreciationPct: {
    key: "appreciationPct",
    label: "Home appreciation",
    kind: "percent",
    range: 0.02,
    step: 0.005,
  },
  equityReturnPct: {
    key: "equityReturnPct",
    label: "Equity return",
    kind: "percent",
    range: 0.02,
    step: 0.005,
  },
  rentInflationPct: {
    key: "rentInflationPct",
    label: "Rent inflation",
    kind: "percent",
    range: 0.02,
    step: 0.005,
  },
  horizonYears: {
    key: "horizonYears",
    label: "Time horizon",
    kind: "year",
    range: 4,
    step: 1,
    integer: true,
  },
  downPaymentPct: {
    key: "downPaymentPct",
    label: "Down payment",
    kind: "percent",
    range: 0.1,
    step: 0.025,
  },
  box3TaxRate: {
    key: "box3TaxRate",
    label: "Box 3 tax rate",
    kind: "percent",
    range: 0.1, // ±10pp around the default 36% covers 26%–46%
    step: 0.02,
    country: "nl",
  },
};

export interface SensitivityGrid {
  rowAxis: SensitivityAxisKey;
  colAxis: SensitivityAxisKey;
  rowValues: number[];
  colValues: number[];
  deltas: number[][];
}

export interface SensitivityOptions {
  rowAxis?: SensitivityAxisKey;
  colAxis?: SensitivityAxisKey;
}

export function runSensitivity(
  base: CountryInputs,
  opts: SensitivityOptions = {},
): SensitivityGrid {
  const rowAxis = opts.rowAxis ?? "mortgageRate";
  const colAxis = opts.colAxis ?? "appreciationPct";

  const rowCfg = SENSITIVITY_AXES[rowAxis];
  const colCfg = SENSITIVITY_AXES[colAxis];

  const rowValues = makeRange(
    extractCenter(base, rowAxis),
    rowCfg.range,
    rowCfg.step,
    rowCfg.integer,
  );
  const colValues = makeRange(
    extractCenter(base, colAxis),
    colCfg.range,
    colCfg.step,
    colCfg.integer,
  );

  const deltas = rowValues.map((rowVal) =>
    colValues.map((colVal) => {
      const patched = {
        ...base,
        [rowAxis]: rowVal,
        [colAxis]: colVal,
      } as CountryInputs;
      // Sanity: horizon must stay ≤ term. Clip horizon if needed.
      if ("horizonYears" in patched && patched.horizonYears > patched.termYears) {
        patched.horizonYears = patched.termYears;
      }
      return runSimulation(patched).delta;
    }),
  );

  return { rowAxis, colAxis, rowValues, colValues, deltas };
}

function extractCenter(base: CountryInputs, key: SensitivityAxisKey): number {
  // Country-scoped axes (e.g. box3TaxRate) only exist on matching inputs.
  // The picker filters them by country before we get here.
  return (base as unknown as Record<string, number>)[key];
}

function makeRange(
  center: number,
  range: number,
  step: number,
  integer?: boolean,
): number[] {
  const halfSteps = Math.round(range / step);
  const out: number[] = [];
  for (let i = -halfSteps; i <= halfSteps; i++) {
    let v = center + i * step;
    if (integer) v = Math.round(v);
    out.push(Math.max(0, v));
  }
  // Deduplicate (integer rounding can collapse adjacent values for small steps).
  return Array.from(new Set(out));
}
