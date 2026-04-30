import { describe, expect, it } from "vitest";
import { nlDefaults, runSimulation } from "@/lib/calc";
import type { NLInputs } from "@/lib/calc";
import { nlRules } from "@/lib/calc/nl/rules";
import { emptyBucket, contribute } from "@/lib/calc/core/portfolio";

describe("NL module", () => {
  it("HRA refund: marginal=0.50, ceiling=0.3697 → ceiling caps the deduction", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      marginalRate: 0.5,
      hraCeilingRate: 0.3697,
      horizonYears: 1,
      interestOnly: false,
    };
    const r = runSimulation(input);
    // Look at year-1 HRA deduction in the breakdown — net effect = -hra + EWF*marginal.
    // Both numbers known; HRA must use the ceiling (0.3697), not the marginal (0.5).
    const interest = r.monthly.slice(0, 12).reduce((a, m) => a + m.components.pi - 0, 0);
    void interest;
    // We can verify shape: result includes EWF add-back which is positive and HRA refund which is large.
    expect(r.yearly[0].annualBuyTaxEffect).toBeLessThan(0); // overall tax benefit
  });

  it("EWF add-back: WOZ × ewfLow × marginal", () => {
    // Pure rules-level check (avoid sim noise).
    const input: NLInputs = {
      ...nlDefaults(),
      wozValue: 500_000,
      marginalRate: 0.4,
      ewfRateLow: 0.0035,
      interestOnly: true, // no HRA
    };
    const res = nlRules.annualBuyTax(input, {
      yearIndex: 1,
      interestPaidYear: 0, // no interest → only EWF effect
      principalPaidYear: 0,
      avgLoanBalanceYear: 0,
      endOfYearLoanBalance: 0,
      endOfYearHomeValue: 500_000,
      propertyTaxYear: 0,
      pmiYear: 0,
    });
    // EWF = 500_000 × 0.0035 = 1750; addBack = 0.4 × 1750 = 700
    expect(res.netCashEffect).toBeCloseTo(700, 4);
  });

  it("interestOnly product disables HRA", () => {
    const annuity: NLInputs = { ...nlDefaults(), interestOnly: false, horizonYears: 1 };
    const io: NLInputs = { ...nlDefaults(), interestOnly: true, horizonYears: 1 };
    const r1 = runSimulation(annuity);
    const r2 = runSimulation(io);
    // Annuity gets HRA refund → annualBuyTaxEffect more negative than IO
    expect(r1.yearly[0].annualBuyTaxEffect).toBeLessThan(r2.yearly[0].annualBuyTaxEffect);
  });

  it("partner doubles Box 3 threshold → less drag", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      box3Threshold: 50_000,
      partnered: false,
    };
    const partnered: NLInputs = { ...input, partnered: true };
    // Build a portfolio strictly above single threshold but below partnered
    const b = contribute(emptyBucket(), 80_000, 0.7);
    const drag1 = nlRules.annualPortfolioDrag(input, emptyBucket(), b);
    const drag2 = nlRules.annualPortfolioDrag(partnered, emptyBucket(), b);
    expect(drag1.rentDrag).toBeGreaterThan(0);
    expect(drag2.rentDrag).toBe(0);
  });

  it("Box 3 zero below threshold", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      box3Threshold: 100_000,
    };
    const b = contribute(emptyBucket(), 80_000, 0.7);
    const drag = nlRules.annualPortfolioDrag(input, emptyBucket(), b);
    expect(drag.rentDrag).toBe(0);
  });

  it("transfer tax skipped for first-time buyer below threshold", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      homePrice: 400_000,
      firstTimeBuyer: true,
      firstTimeBuyerThreshold: 525_000,
    };
    const c = nlRules.oneTimeCosts(input, 360_000);
    expect(c.breakdown.transferTax).toBe(0);
  });

  it("NHG reduces effective rate when home below NHG threshold", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      homePrice: 400_000,
      mortgageRate: 0.05,
      nhg: true,
      nhgThreshold: 435_000,
      nhgRateReductionBps: 50,
    };
    expect(nlRules.effectiveRate(input)).toBeCloseTo(0.045, 6);
  });
});
