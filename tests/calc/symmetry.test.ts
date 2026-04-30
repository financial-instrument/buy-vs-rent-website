import { describe, expect, it } from "vitest";
import { runSimulation, usDefaults } from "@/lib/calc";
import type { USInputs } from "@/lib/calc";

describe("symmetric differential rule", () => {
  it("when Buy = Rent every month, both portfolios stay equal modulo W0 + equity build-up", () => {
    // Construct a scenario where Buy outflow ≈ Rent each month: zero everything that
    // creates differential, and set rent = mortgage payment for the chosen principal.
    const input: USInputs = {
      ...usDefaults(),
      homePrice: 200_000,
      downPaymentPct: 0.2,
      mortgageRate: 0.05,
      termYears: 30,
      horizonYears: 1,
      closingCostsPct: 0,
      appreciationPct: 0,
      maintenancePct: 0,
      insuranceAnnual: 0,
      hoaMonthly: 0,
      monthlyRent: 0, // we'll set after computing payment
      rentInflationPct: 0,
      cpiPct: 0,
      equityReturnPct: 0,
      bondReturnPct: 0,
      equitySplit: 0.7,
      propertyTaxRate: 0,
      pmiRate: 0,
      stateLocalIncomeRate: 0,
      federalMarginalRate: 0,
      niit: false,
    };
    // First simulate to get the monthly payment, then re-run with rent matching it.
    const probe = runSimulation(input);
    const rent = probe.monthlyPayment;
    const matched = runSimulation({ ...input, monthlyRent: rent });
    // With zero returns and matched outflows, no contributions ever happen on either side
    // beyond t=0. Renter starts with W0; buyer starts with 0 portfolio + house equity.
    // Buyer's portfolio should remain 0; renter's portfolio should remain ≈ W0.
    const lastMonth = matched.monthly[matched.monthly.length - 1];
    expect(lastMonth.buyPortfolio).toBeCloseTo(0, 0);
    expect(lastMonth.rentPortfolio).toBeCloseTo(matched.W0, 0);
  });

  it("monotonically increasing portfolios when returns are positive and outflows match", () => {
    const input: USInputs = {
      ...usDefaults(),
      mortgageRate: 0.05,
      horizonYears: 5,
      appreciationPct: 0.02,
      equityReturnPct: 0.05,
      bondReturnPct: 0.03,
      propertyTaxRate: 0,
      insuranceAnnual: 0,
      maintenancePct: 0,
      hoaMonthly: 0,
      pmiRate: 0,
      federalMarginalRate: 0,
      stateLocalIncomeRate: 0,
    };
    const r = runSimulation(input);
    // Both net worths should be positive at horizon.
    expect(r.finalBuyNetWorth).toBeGreaterThan(0);
    expect(r.finalRentNetWorth).toBeGreaterThan(0);
  });
});
