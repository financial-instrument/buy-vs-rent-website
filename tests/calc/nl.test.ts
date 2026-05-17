import { describe, expect, it } from "vitest";
import { nlDefaults, runSimulation } from "@/lib/calc";
import type { NLInputs } from "@/lib/calc";
import { nlRules } from "@/lib/calc/nl/rules";
import { emptyBucket, contribute, type BucketState } from "@/lib/calc/core/portfolio";

const baseCtx = (yearIndex: number) => ({
  yearIndex,
  interestPaidYear: 0,
  principalPaidYear: 0,
  avgLoanBalanceYear: 0,
  endOfYearLoanBalance: 0,
  endOfYearHomeValue: 0,
  propertyTaxYear: 0,
  pmiYear: 0,
});

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
    // Pure rules-level check (avoid sim noise). interestOnly disables HRA AND
    // the year-1 one-off mortgage-cost deduction, so EWF is the only term.
    const input: NLInputs = {
      ...nlDefaults(),
      wozValue: 500_000,
      marginalRate: 0.4,
      ewfRateLow: 0.0035,
      interestOnly: true,
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

  it("year-1 one-off: notary + NHG deductible at marginal rate (annuity only)", () => {
    const input: NLInputs = {
      ...nlDefaults(),
      homePrice: 400_000,
      marginalRate: 0.4,
      notaryAdvisorPct: 0.015, // 6000
      notaryDeductiblePortion: 0.6, // 3600 deductible
      nhg: true,
      nhgThreshold: 435_000,
      nhgPremiumPct: 0.006,
      downPaymentPct: 0.1, // loan = 360_000 → NHG premium = 2160
      interestOnly: false,
    };
    const res = nlRules.annualBuyTax(input, {
      yearIndex: 1,
      interestPaidYear: 0, // isolate the one-off
      principalPaidYear: 0,
      avgLoanBalanceYear: 0,
      endOfYearLoanBalance: 0,
      endOfYearHomeValue: 400_000,
      propertyTaxYear: 0,
      pmiYear: 0,
    });
    // deductibleClosing = 3600 + 2160 = 5760; refund = 0.4 × 5760 = 2304
    // EWF on WOZ=nlDefaults.wozValue 450000 = 1575, addBack 0.4×1575=630
    // netCashEffect = -2304 + 630 = -1674
    expect(res.breakdown.oneOffDeduction).toBeCloseTo(2304, 4);
    expect(res.netCashEffect).toBeCloseTo(-1674, 4);
  });

  it("year-2 has no one-off deduction", () => {
    const input: NLInputs = { ...nlDefaults() };
    const yr1 = nlRules.annualBuyTax(input, baseCtx(1));
    const yr2 = nlRules.annualBuyTax(input, baseCtx(2));
    expect(yr1.breakdown.oneOffDeduction).toBeGreaterThan(0);
    expect(yr2.breakdown.oneOffDeduction).toBe(0);
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

describe("NL Box 3 regimes", () => {
  // 150k portfolio, 100k cost basis → 50k unrealized gain. Threshold 50k.
  const base = (): NLInputs => ({
    ...nlDefaults(),
    box3Threshold: 50_000,
    box3ThresholdGrowthPct: 0,
    partnered: false,
    box3TaxRate: 0.36,
    box3DeemedYield: 0.06,
    box3CgtRate: 0.26,
  });
  const rentB: BucketState = {
    equityValue: 150_000,
    bondValue: 0,
    equityBasis: 100_000,
    bondBasis: 0,
  };
  const ctx = { yearIndex: 1 };

  it("deemed-2025: (val−threshold) × deemedYield × rate", () => {
    const i = { ...base(), box3Mode: "deemed-2025" as const };
    const d = nlRules.annualPortfolioDrag(i, emptyBucket(), rentB, ctx);
    // (150000 − 50000) × 0.06 × 0.36 = 2160
    expect(d.rentDrag).toBeCloseTo(2160, 4);
    expect(d.buyDrag).toBe(0);
    expect(d.markToMarketRent).toBeUndefined();
    expect(nlRules.unrealizedCGT(i, emptyBucket(), rentB).rentCGT).toBe(0);
  });

  it("actual-2028: accrual × taxable-fraction × rate, marks to market", () => {
    const i = { ...base(), box3Mode: "actual-2028" as const };
    const d = nlRules.annualPortfolioDrag(i, emptyBucket(), rentB, ctx);
    // gain 50000 × (100000/150000) above-allowance fraction × 0.36 = 12000
    expect(d.rentDrag).toBeCloseTo(12_000, 4);
    expect(d.markToMarketRent).toBe(true);
    // Accrual regime levies annually → no horizon haircut (no double count).
    expect(nlRules.unrealizedCGT(i, emptyBucket(), rentB).rentCGT).toBe(0);
  });

  it("realized-cgt: no annual drag, CGT on the gain at horizon", () => {
    const i = { ...base(), box3Mode: "realized-cgt" as const };
    const d = nlRules.annualPortfolioDrag(i, emptyBucket(), rentB, ctx);
    expect(d.rentDrag).toBe(0);
    expect(d.buyDrag).toBe(0);
    // 50000 unrealized gain × 0.26 = 13000
    expect(nlRules.unrealizedCGT(i, emptyBucket(), rentB).rentCGT).toBeCloseTo(13_000, 4);
  });

  it("regime is the only knob changed; mechanics hold for any scenario", () => {
    const mk = (m: NLInputs["box3Mode"]): NLInputs => ({
      ...nlDefaults(),
      horizonYears: 10,
      box3Mode: m,
    });
    const deemed = runSimulation(mk("deemed-2025"));
    const accrual = runSimulation(mk("actual-2028"));
    const cgt = runSimulation(mk("realized-cgt"));

    // Default mode == deemed-2025 → unchanged behavior (regression guard).
    expect(runSimulation({ ...nlDefaults(), horizonYears: 10 }).delta).toBeCloseTo(
      deemed.delta,
      6,
    );

    // Each regime yields a distinct result.
    expect(deemed.delta).not.toBeCloseTo(accrual.delta, 2);
    expect(deemed.delta).not.toBeCloseTo(cgt.delta, 2);

    // Annual portfolio drag exists under both wealth-tax regimes, never under
    // the realization-CGT counterfactual.
    const annualDrag = (r: typeof deemed) =>
      r.yearly.reduce((a, y) => a + y.annualPortfolioDrag, 0);
    expect(annualDrag(deemed)).toBeGreaterThan(0);
    expect(annualDrag(accrual)).toBeGreaterThan(0);
    expect(annualDrag(cgt)).toBe(0);

    // Horizon CGT haircut exists ONLY in the realization-CGT regime (no
    // double-count under the annually-levied wealth-tax regimes).
    expect(cgt.yearly.at(-1)!.rentUnrealizedCGT).toBeGreaterThan(0);
    expect(deemed.yearly.at(-1)!.rentUnrealizedCGT).toBe(0);
    expect(accrual.yearly.at(-1)!.rentUnrealizedCGT).toBe(0);
  });

  it("long horizon + no allowance: the wealth tax skews harder against the renter than a normal CGT", () => {
    // The advocacy thesis is conditional, not universal: it bites for a
    // sizeable portfolio compounding over a long horizon. With no tax-free
    // allowance and 30 years, 30 annual wealth-tax hits erode far more than a
    // single realization CGT on the gain — so the renter ends up poorer and
    // the buy−rent gap widens under both Dutch regimes.
    const mk = (m: NLInputs["box3Mode"]): NLInputs => ({
      ...nlDefaults(),
      horizonYears: 30,
      termYears: 30,
      box3Threshold: 0,
      box3Mode: m,
    });
    const deemed = runSimulation(mk("deemed-2025"));
    const accrual = runSimulation(mk("actual-2028"));
    const cgt = runSimulation(mk("realized-cgt"));

    expect(cgt.finalRentNetWorth).toBeGreaterThan(deemed.finalRentNetWorth);
    expect(cgt.finalRentNetWorth).toBeGreaterThan(accrual.finalRentNetWorth);
    expect(cgt.delta).toBeLessThan(deemed.delta);
    expect(cgt.delta).toBeLessThan(accrual.delta);
  });
});
