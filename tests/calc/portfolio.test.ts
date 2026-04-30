import { describe, expect, it } from "vitest";
import {
  applyMonthlyReturn,
  bucketTotal,
  contribute,
  emptyBucket,
  rebalance,
  unrealizedGain,
  withdraw,
} from "@/lib/calc/core/portfolio";

describe("portfolio", () => {
  it("contribute splits by equity ratio and basis tracks contributions", () => {
    const b = contribute(emptyBucket(), 1000, 0.7);
    expect(b.equityValue).toBe(700);
    expect(b.bondValue).toBe(300);
    expect(b.equityBasis).toBe(700);
    expect(b.bondBasis).toBe(300);
  });

  it("applyMonthlyReturn doesn't touch basis", () => {
    let b = contribute(emptyBucket(), 1000, 0.7);
    b = applyMonthlyReturn(b, 0.01, 0.005);
    expect(b.equityValue).toBeCloseTo(707, 4);
    expect(b.bondValue).toBeCloseTo(301.5, 4);
    expect(b.equityBasis).toBe(700);
    expect(b.bondBasis).toBe(300);
  });

  it("rebalance preserves total and basis", () => {
    let b = contribute(emptyBucket(), 1000, 0.7);
    b = applyMonthlyReturn(b, 0.5, 0); // skews to equity-heavy
    const totalBefore = bucketTotal(b);
    const basisBefore = b.equityBasis + b.bondBasis;
    b = rebalance(b, 0.7);
    expect(bucketTotal(b)).toBeCloseTo(totalBefore, 6);
    expect(b.equityBasis + b.bondBasis).toBeCloseTo(basisBefore, 6);
    expect(b.equityValue / bucketTotal(b)).toBeCloseTo(0.7, 6);
  });

  it("withdraw realizes gain proportionally", () => {
    let b = contribute(emptyBucket(), 1000, 0.5);
    b = applyMonthlyReturn(b, 1, 1); // double both → 2000 total, 1000 basis
    const w = withdraw(b, 500);
    expect(w.amount).toBe(500);
    // Gain ratio = 1000/2000 = 0.5, so half of withdrawal is gain
    expect(w.equityGainRealized + w.bondGainRealized).toBeCloseTo(250, 4);
  });

  it("unrealizedGain is bucket-aware", () => {
    let b = contribute(emptyBucket(), 1000, 0.7);
    b = applyMonthlyReturn(b, 1, 0); // equity doubles, bond flat
    const g = unrealizedGain(b);
    expect(g.equity).toBeCloseTo(700, 4);
    expect(g.bond).toBeCloseTo(0, 4);
  });
});
