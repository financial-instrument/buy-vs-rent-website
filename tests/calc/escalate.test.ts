import { describe, expect, it } from "vitest";
import { escalate } from "@/lib/calc/core/escalate";
import {
  itDefaults,
  nlDefaults,
  runSimulation,
  usDefaults,
} from "@/lib/calc";
import type { ITInputs, NLInputs, USInputs } from "@/lib/calc";
import { nlRules } from "@/lib/calc/nl/rules";
import { contribute, emptyBucket } from "@/lib/calc/core/portfolio";
import { itRules } from "@/lib/calc/it/rules";

describe("escalate helper", () => {
  it("returns base when growth = 0", () => {
    expect(escalate(100, 0, 5)).toBe(100);
  });
  it("returns base when yearIndex = 0", () => {
    expect(escalate(100, 0.05, 0)).toBe(100);
  });
  it("compounds", () => {
    expect(escalate(100, 0.02, 10)).toBeCloseTo(100 * Math.pow(1.02, 10), 6);
  });
  it("handles negative growth (cuts)", () => {
    expect(escalate(100, -0.1, 2)).toBeCloseTo(81, 4);
  });
});

describe("policy growth wired into rules", () => {
  it("NL: growing Box 3 threshold reduces drag over time", () => {
    const base: NLInputs = { ...nlDefaults(), box3Threshold: 50_000, partnered: false };
    const grown: NLInputs = { ...base, box3ThresholdGrowthPct: 0.5 }; // huge growth
    const portfolio = contribute(emptyBucket(), 80_000, 0.7);
    // Year 1 (yearIndex=1): same threshold
    const dragY1Base = nlRules.annualPortfolioDrag(base, emptyBucket(), portfolio, { yearIndex: 1 });
    const dragY1Grown = nlRules.annualPortfolioDrag(grown, emptyBucket(), portfolio, { yearIndex: 1 });
    expect(dragY1Base.rentDrag).toBeCloseTo(dragY1Grown.rentDrag, 6);
    // Year 5 (yearIndex=5): grown threshold should be much higher → less drag
    const dragY5Base = nlRules.annualPortfolioDrag(base, emptyBucket(), portfolio, { yearIndex: 5 });
    const dragY5Grown = nlRules.annualPortfolioDrag(grown, emptyBucket(), portfolio, { yearIndex: 5 });
    expect(dragY5Grown.rentDrag).toBeLessThan(dragY5Base.rentDrag);
  });

  it("US: growing standard deduction shrinks itemize benefit over time", () => {
    const base: USInputs = {
      ...usDefaults(),
      homePrice: 800_000,
      mortgageRate: 0.07,
      federalMarginalRate: 0.32,
      propertyTaxRate: 0.015,
      horizonYears: 5,
    };
    const grown: USInputs = { ...base, standardDeductionGrowthPct: 0.2 };
    const r1 = runSimulation(base);
    const r2 = runSimulation(grown);
    // Year 5 itemize benefit (more negative annualBuyTaxEffect) shrinks under growth
    const baseY5 = r1.yearly[4].annualBuyTaxEffect;
    const grownY5 = r2.yearly[4].annualBuyTaxEffect;
    expect(grownY5).toBeGreaterThan(baseY5); // less negative → smaller refund
  });

  it("IT: growing mutuo cap raises the credit ceiling over time", () => {
    const base: ITInputs = { ...itDefaults() };
    const grown: ITInputs = { ...base, mutuoInterestCapGrowthPct: 0.5 };
    const ctxFar = {
      yearIndex: 10,
      interestPaidYear: 100_000, // way above any cap
      principalPaidYear: 0,
      avgLoanBalanceYear: 0,
      endOfYearLoanBalance: 0,
      endOfYearHomeValue: 0,
      propertyTaxYear: 0,
      pmiYear: 0,
    };
    const baseRes = itRules.annualBuyTax(base, ctxFar);
    const grownRes = itRules.annualBuyTax(grown, ctxFar);
    expect(Math.abs(grownRes.netCashEffect)).toBeGreaterThan(Math.abs(baseRes.netCashEffect));
  });

  it("NL: WOZ growth raises OZB monthly cost across years", () => {
    const base: NLInputs = { ...nlDefaults(), wozValue: 400_000, ozbRate: 0.001 };
    const grown: NLInputs = { ...base, wozGrowthPct: 0.05 };
    const ctxY0 = {
      monthIndex: 0,
      yearIndex: 0,
      loanBalance: 0,
      homeValue: 400_000,
      interestThisMonth: 0,
      loanOriginal: 0,
    };
    const ctxY10 = { ...ctxY0, yearIndex: 10 };
    expect(nlRules.monthlyPropertyTax(grown, ctxY0)).toBeCloseTo(
      nlRules.monthlyPropertyTax(base, ctxY0),
      6,
    );
    expect(nlRules.monthlyPropertyTax(grown, ctxY10)).toBeGreaterThan(
      nlRules.monthlyPropertyTax(base, ctxY10),
    );
  });

  it("URL round-trip preserves growth fields", async () => {
    const { encode } = await import("@/lib/url/encode");
    const { decode } = await import("@/lib/url/decode");
    const orig: NLInputs = { ...nlDefaults(), box3ThresholdGrowthPct: 0.025, wozGrowthPct: 0.03 };
    const back = decode("nl", new URLSearchParams(encode(orig)));
    expect(back).toEqual(orig);
  });
});
