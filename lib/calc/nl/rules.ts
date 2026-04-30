import { bucketTotal } from "../core/portfolio";
import type {
  AnnualBuyTaxResult,
  AnnualPortfolioDragResult,
  CountryRules,
  MonthlyExtras,
  OneTimeCosts,
  RealizationCGT,
} from "../core/rules";
import type { CountryInputs, NLInputs } from "../core/types";
import { nlDefaults } from "./defaults";

export const nlRules: CountryRules = {
  defaults: () => nlDefaults(),
  effectiveRate: (input) => {
    const i = input as NLInputs;
    if (i.nhg && i.homePrice <= i.nhgThreshold) {
      return Math.max(0, i.mortgageRate - i.nhgRateReductionBps / 10_000);
    }
    return i.mortgageRate;
  },
  oneTimeCosts: (input, loanPrincipal): OneTimeCosts => {
    const i = input as NLInputs;
    const ftbExempt = i.firstTimeBuyer && i.homePrice <= i.firstTimeBuyerThreshold;
    const transferTax = ftbExempt ? 0 : i.transferTaxRate * i.homePrice;
    const notary = i.notaryAdvisorPct * i.homePrice;
    const nhgPremium =
      i.nhg && i.homePrice <= i.nhgThreshold ? i.nhgPremiumPct * loanPrincipal : 0;
    const total = transferTax + notary + nhgPremium;
    return {
      closingTotal: total,
      breakdown: { transferTax, notary, nhgPremium },
    };
  },
  monthlyExtras: (): MonthlyExtras => ({ countryAdj: 0 }),
  annualBuyTax: (input, ctx): AnnualBuyTaxResult => {
    const i = input as NLInputs;
    // Eigenwoningforfait
    const woz = i.wozValue;
    const ewf = woz <= i.ewfHighThreshold
      ? woz * i.ewfRateLow
      : i.ewfHighThreshold * i.ewfRateLow + (woz - i.ewfHighThreshold) * i.ewfRateHigh;

    // HRA: deductible at min(marginal, ceiling). Only for annuity (interestOnly OFF).
    const hraRate = Math.min(i.marginalRate, i.hraCeilingRate);
    const hraDeduction = i.interestOnly ? 0 : hraRate * ctx.interestPaidYear;
    const ewfAddBack = i.marginalRate * ewf;

    // Net effect: HRA reduces tax (negative cash effect), EWF increases it.
    const netCashEffect = -hraDeduction + ewfAddBack;
    return {
      netCashEffect,
      breakdown: { ewf, hraDeduction, ewfAddBack, hraRate },
    };
  },
  annualPortfolioDrag: (input, buyBucket, rentBucket): AnnualPortfolioDragResult => {
    const i = input as NLInputs;
    const threshold = i.partnered ? i.box3Threshold * 2 : i.box3Threshold;
    const compute = (val: number) => {
      const taxable = Math.max(0, val - threshold);
      const deemed = taxable * i.box3DeemedYield;
      return deemed * i.box3TaxRate;
    };
    const buyDrag = compute(bucketTotal(buyBucket));
    const rentDrag = compute(bucketTotal(rentBucket));
    return { buyDrag, rentDrag, breakdown: { threshold } };
  },
  unrealizedCGT: (): RealizationCGT => ({ buyCGT: 0, rentCGT: 0 }),
};
