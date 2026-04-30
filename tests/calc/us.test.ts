import { describe, expect, it } from "vitest";
import { runSimulation, usDefaults } from "@/lib/calc";
import type { USInputs } from "@/lib/calc";

describe("US module", () => {
  it("itemizes when MID + SALT > standard deduction", () => {
    const input: USInputs = {
      ...usDefaults(),
      homePrice: 800_000,
      downPaymentPct: 0.2,
      mortgageRate: 0.07,
      filing: "single",
      federalMarginalRate: 0.32,
      propertyTaxRate: 0.015,
      horizonYears: 1,
      termYears: 30,
    };
    const r = runSimulation(input);
    const yr1 = r.yearly[0];
    // First-year MID benefit should be > 0 (itemize wins)
    expect(yr1.annualBuyTaxEffect).toBeLessThan(0);
  });

  it("takes standard deduction when interest+SALT < standard", () => {
    const input: USInputs = {
      ...usDefaults(),
      homePrice: 200_000,
      downPaymentPct: 0.5, // tiny loan
      mortgageRate: 0.04,
      filing: "single",
      propertyTaxRate: 0.005,
      stateLocalIncomeRate: 0,
      horizonYears: 1,
      termYears: 30,
    };
    const r = runSimulation(input);
    const yr1 = r.yearly[0];
    expect(yr1.annualBuyTaxEffect).toBeCloseTo(0, 6);
  });

  it("MFJ standard deduction is 2x single in our parameter set", () => {
    const d = usDefaults();
    expect(d.standardDeductionMFJ).toBe(2 * d.standardDeductionSingle);
  });

  it("PMI applies while LTV > 80%", () => {
    const lowLTV: USInputs = {
      ...usDefaults(),
      downPaymentPct: 0.25,
      pmiRate: 0.01,
      horizonYears: 1,
    };
    const highLTV: USInputs = { ...usDefaults(), downPaymentPct: 0.05, pmiRate: 0.01, horizonYears: 1 };
    const rLow = runSimulation(lowLTV);
    const rHigh = runSimulation(highLTV);
    // High-LTV should have PMI > 0 in early months
    expect(rHigh.monthly[0].components.pmi).toBeGreaterThan(0);
    expect(rLow.monthly[0].components.pmi).toBe(0);
  });

  it("LTCG affects rent-side net worth via unrealized CGT haircut", () => {
    const noNiit: USInputs = { ...usDefaults(), niit: false, horizonYears: 10 };
    const withNiit: USInputs = { ...usDefaults(), niit: true, horizonYears: 10 };
    const r1 = runSimulation(noNiit);
    const r2 = runSimulation(withNiit);
    // NIIT bumps the haircut → smaller rent net worth
    expect(r2.finalRentNetWorth).toBeLessThan(r1.finalRentNetWorth);
  });

  it("simulation produces horizonYears yearly snapshots", () => {
    const input = usDefaults();
    const r = runSimulation(input);
    expect(r.yearly).toHaveLength(input.horizonYears);
  });

  it("acquisition-debt cap reduces deductible interest", () => {
    const big: USInputs = {
      ...usDefaults(),
      homePrice: 2_000_000,
      downPaymentPct: 0.2,
      mortgageRate: 0.07,
      filing: "single",
      federalMarginalRate: 0.37,
      propertyTaxRate: 0.015,
      horizonYears: 1,
      acquisitionDebtCap: 750_000,
    };
    const noCap: USInputs = { ...big, acquisitionDebtCap: 100_000_000 };
    const r1 = runSimulation(big);
    const r2 = runSimulation(noCap);
    // No-cap version gets a bigger refund (more negative annualBuyTaxEffect)
    expect(r2.yearly[0].annualBuyTaxEffect).toBeLessThan(r1.yearly[0].annualBuyTaxEffect);
  });
});
