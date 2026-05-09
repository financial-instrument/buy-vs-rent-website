import { runSimulation } from "./index";
import type { CountryInputs } from "./core/types";

export interface SensitivityGrid {
  rates: number[];
  appreciations: number[];
  deltas: number[][];
}

export interface SensitivityOptions {
  rateRange?: number;
  appRange?: number;
  step?: number;
}

export function runSensitivity(
  base: CountryInputs,
  opts: SensitivityOptions = {},
): SensitivityGrid {
  const rateRange = opts.rateRange ?? 0.02;
  const appRange = opts.appRange ?? 0.02;
  const step = opts.step ?? 0.005;

  const rates = makeRange(base.mortgageRate, rateRange, step);
  const appreciations = makeRange(base.appreciationPct, appRange, step);

  const deltas = rates.map((rate) =>
    appreciations.map((appreciationPct) => {
      const result = runSimulation({
        ...base,
        mortgageRate: rate,
        appreciationPct,
      });
      return result.delta;
    }),
  );

  return { rates, appreciations, deltas };
}

function makeRange(center: number, range: number, step: number): number[] {
  const halfSteps = Math.round(range / step);
  const out: number[] = [];
  for (let i = -halfSteps; i <= halfSteps; i++) {
    const v = center + i * step;
    out.push(Math.max(0, v));
  }
  return out;
}
