// Country-agnostic hook surface. Each country module implements this.
// Keeps simulate.ts free of per-country branching.

import type { BucketState } from "./portfolio";
import type { CountryInputs } from "./types";

export interface OneTimeCosts {
  // All deducted from W0 at t=0, paid by buyer.
  closingTotal: number;
  breakdown: Record<string, number>;
}

export interface MonthlyExtras {
  // Country-specific monthly add-on (e.g. nothing for now; placeholder for future).
  countryAdj: number;
}

export interface AnnualBuyTaxResult {
  // Net effect on buy-side cash: NEGATIVE = refund/credit (renter-equivalent saving on buy side),
  // POSITIVE = additional tax. Applied at year tick to the buy side.
  netCashEffect: number;
  breakdown: Record<string, number>;
}

export interface AnnualPortfolioDragResult {
  // Tax that bleeds *out* of each portfolio at year-end (NL Box 3, IT bollo).
  buyDrag: number;
  rentDrag: number;
  breakdown: Record<string, number>;
}

export interface RealizationCGT {
  // CGT owed if the bucket were liquidated today.
  buyCGT: number;
  rentCGT: number;
}

export interface CountryRules {
  defaults(): CountryInputs;
  oneTimeCosts(input: CountryInputs, loanPrincipal: number): OneTimeCosts;
  monthlyExtras(input: CountryInputs, ctx: MonthlyContext): MonthlyExtras;
  annualBuyTax(input: CountryInputs, ctx: AnnualContext): AnnualBuyTaxResult;
  annualPortfolioDrag(
    input: CountryInputs,
    buy: BucketState,
    rent: BucketState,
  ): AnnualPortfolioDragResult;
  unrealizedCGT(input: CountryInputs, buy: BucketState, rent: BucketState): RealizationCGT;
  // Effective mortgage rate after country-specific adjustments (e.g. NHG bps reduction).
  effectiveRate(input: CountryInputs): number;
}

export interface MonthlyContext {
  monthIndex: number; // 0-based month from t=0
  yearIndex: number; // 0-based
  loanBalance: number;
  homeValue: number;
  interestThisMonth: number;
  loanOriginal: number;
}

export interface AnnualContext {
  yearIndex: number; // 1-based year just completed
  interestPaidYear: number;
  principalPaidYear: number;
  avgLoanBalanceYear: number;
  endOfYearLoanBalance: number;
  endOfYearHomeValue: number;
  propertyTaxYear: number;
  pmiYear: number;
}
