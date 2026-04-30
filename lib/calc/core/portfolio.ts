// Two-bucket portfolio (equity ETF, government bonds) with monthly compounding,
// optional annual rebalance to a target equity split, and basis tracking per bucket.
//
// Basis tracking lets country modules compute realization tax (US LTCG, IT 26%/12.5%).

export interface BucketState {
  equityValue: number;
  bondValue: number;
  equityBasis: number;
  bondBasis: number;
}

export function emptyBucket(): BucketState {
  return { equityValue: 0, bondValue: 0, equityBasis: 0, bondBasis: 0 };
}

export function bucketTotal(b: BucketState): number {
  return b.equityValue + b.bondValue;
}

export function bucketBasis(b: BucketState): number {
  return b.equityBasis + b.bondBasis;
}

export function annualToMonthly(annualReturn: number): number {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

export function applyMonthlyReturn(
  b: BucketState,
  monthlyEquityReturn: number,
  monthlyBondReturn: number,
): BucketState {
  return {
    ...b,
    equityValue: b.equityValue * (1 + monthlyEquityReturn),
    bondValue: b.bondValue * (1 + monthlyBondReturn),
  };
}

export function contribute(b: BucketState, amount: number, equitySplit: number): BucketState {
  if (amount <= 0) return b;
  const eq = amount * equitySplit;
  const bd = amount - eq;
  return {
    equityValue: b.equityValue + eq,
    bondValue: b.bondValue + bd,
    equityBasis: b.equityBasis + eq,
    bondBasis: b.bondBasis + bd,
  };
}

// Rebalance to target split. We treat rebalance as cost-basis-preserving in v1
// (in reality it would realize gains; documented as a v1 simplification).
// We rescale basis pro-rata to the new value distribution.
export function rebalance(b: BucketState, equitySplit: number): BucketState {
  const total = bucketTotal(b);
  if (total <= 0) return b;
  const totalBasis = bucketBasis(b);
  const targetEq = total * equitySplit;
  const targetBd = total - targetEq;
  // Pro-rata basis split based on new value mix
  const eqBasis = totalBasis * equitySplit;
  const bdBasis = totalBasis - eqBasis;
  return {
    equityValue: targetEq,
    bondValue: targetBd,
    equityBasis: eqBasis,
    bondBasis: bdBasis,
  };
}

// Withdraw `amount` proportionally from each bucket; reduce basis proportionally per bucket.
// Returns the updated bucket and the realized gain in each bucket.
export interface Withdrawal {
  bucket: BucketState;
  equityGainRealized: number;
  bondGainRealized: number;
  amount: number;
}

export function withdraw(b: BucketState, amount: number): Withdrawal {
  const total = bucketTotal(b);
  if (total <= 0 || amount <= 0) {
    return { bucket: b, equityGainRealized: 0, bondGainRealized: 0, amount: 0 };
  }
  const w = Math.min(amount, total);
  const eqW = w * (b.equityValue / total);
  const bdW = w * (b.bondValue / total);
  const eqBasisW = b.equityValue > 0 ? eqW * (b.equityBasis / b.equityValue) : 0;
  const bdBasisW = b.bondValue > 0 ? bdW * (b.bondBasis / b.bondValue) : 0;
  return {
    bucket: {
      equityValue: b.equityValue - eqW,
      bondValue: b.bondValue - bdW,
      equityBasis: b.equityBasis - eqBasisW,
      bondBasis: b.bondBasis - bdBasisW,
    },
    equityGainRealized: eqW - eqBasisW,
    bondGainRealized: bdW - bdBasisW,
    amount: w,
  };
}

export function unrealizedGain(b: BucketState): { equity: number; bond: number; total: number } {
  const equity = Math.max(0, b.equityValue - b.equityBasis);
  const bond = Math.max(0, b.bondValue - b.bondBasis);
  return { equity, bond, total: equity + bond };
}
