import { describe, expect, it } from "vitest";
import { itDefaults, runSimulation } from "@/lib/calc";
import type { ITInputs } from "@/lib/calc";
import { itRules } from "@/lib/calc/it/rules";
import { contribute, emptyBucket } from "@/lib/calc/core/portfolio";

describe("IT module", () => {
  it("registration tax = 2% × cadastral value (prima casa)", () => {
    const input: ITInputs = { ...itDefaults(), cadastralValue: 100_000 };
    const c = itRules.oneTimeCosts(input, 0);
    expect(c.breakdown.registro).toBeCloseTo(2_000, 2);
  });

  it("mutuo deduction caps at €4,000 × 19%", () => {
    const input: ITInputs = { ...itDefaults() };
    const big = itRules.annualBuyTax(input, {
      yearIndex: 1,
      interestPaidYear: 12_000, // way above cap
      principalPaidYear: 0,
      avgLoanBalanceYear: 0,
      endOfYearLoanBalance: 0,
      endOfYearHomeValue: 0,
      propertyTaxYear: 0,
      pmiYear: 0,
    });
    expect(big.breakdown.credit).toBeCloseTo(0.19 * 4000, 4);
    expect(big.netCashEffect).toBeCloseTo(-0.19 * 4000, 4);
  });

  it("mutuo deduction at low interest = 19% × interest", () => {
    const input: ITInputs = { ...itDefaults() };
    const small = itRules.annualBuyTax(input, {
      yearIndex: 1,
      interestPaidYear: 1_000,
      principalPaidYear: 0,
      avgLoanBalanceYear: 0,
      endOfYearLoanBalance: 0,
      endOfYearHomeValue: 0,
      propertyTaxYear: 0,
      pmiYear: 0,
    });
    expect(small.breakdown.credit).toBeCloseTo(0.19 * 1000, 4);
  });

  it("realization CGT: 26% equity vs 12.5% gov-bond on same nominal gain", () => {
    const input: ITInputs = { ...itDefaults() };
    // Equity gain 1000
    const eqBucket = { equityValue: 2000, bondValue: 0, equityBasis: 1000, bondBasis: 0 };
    const bdBucket = { equityValue: 0, bondValue: 2000, equityBasis: 0, bondBasis: 1000 };
    const eqCgt = itRules.unrealizedCGT(input, emptyBucket(), eqBucket).rentCGT;
    const bdCgt = itRules.unrealizedCGT(input, emptyBucket(), bdBucket).rentCGT;
    expect(eqCgt).toBeCloseTo(260, 4);
    expect(bdCgt).toBeCloseTo(125, 4);
  });

  it("bollo = 0.2% × portfolio market value", () => {
    const input: ITInputs = { ...itDefaults() };
    const b = contribute(emptyBucket(), 100_000, 0.7);
    const drag = itRules.annualPortfolioDrag(input, emptyBucket(), b);
    expect(drag.rentDrag).toBeCloseTo(200, 4);
  });

  it("agent + IVA: 3% + 22% IVA on net = 3.66% gross", () => {
    const input: ITInputs = { ...itDefaults(), homePrice: 100_000 };
    const c = itRules.oneTimeCosts(input, 0);
    // 3000 net + 660 IVA = 3660
    expect(c.breakdown.agent).toBeCloseTo(3660, 2);
  });
});
