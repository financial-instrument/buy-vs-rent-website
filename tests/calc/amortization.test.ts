import { describe, expect, it } from "vitest";
import { amortizeMonth, monthlyPayment } from "@/lib/calc/core/amortization";

describe("amortization", () => {
  it("computes US 30-yr fixed payment for a known case", () => {
    // $300,000 @ 6% over 30 years → $1,798.65/mo (industry standard rounding)
    const m = monthlyPayment({ principal: 300_000, annualRate: 0.06, termMonths: 360 });
    expect(m).toBeCloseTo(1798.65, 1);
  });

  it("computes payment for $480,000 @ 6.5% / 30 yr", () => {
    // Standard formula: P·r/(1-(1+r)^-n) where r=0.065/12 → ~$3,033.93/mo
    const m = monthlyPayment({ principal: 480_000, annualRate: 0.065, termMonths: 360 });
    expect(m).toBeCloseTo(3033.93, 1);
  });

  it("zero rate → linear amortization", () => {
    const m = monthlyPayment({ principal: 360_000, annualRate: 0, termMonths: 360 });
    expect(m).toBe(1000);
  });

  it("amortizeMonth: interest = balance × monthlyRate", () => {
    const split = amortizeMonth(300_000, 0.06, 1798.65);
    expect(split.interest).toBeCloseTo(1500, 2);
    expect(split.principal).toBeCloseTo(298.65, 2);
    expect(split.balanceAfter).toBeCloseTo(299_701.35, 2);
  });

  it("ending balance after the full term is ~0", () => {
    const principal = 300_000;
    const rate = 0.06;
    const n = 360;
    const M = monthlyPayment({ principal, annualRate: rate, termMonths: n });
    let bal = principal;
    for (let i = 0; i < n; i++) {
      bal = amortizeMonth(bal, rate, M).balanceAfter;
    }
    expect(bal).toBeCloseTo(0, 2);
  });
});
