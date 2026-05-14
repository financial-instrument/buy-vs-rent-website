import { escalate } from "../core/escalate";
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
    const closingFlat = i.closingCostsFlat;
    const total = transferTax + notary + nhgPremium + closingFlat;
    return {
      closingTotal: total,
      breakdown: { transferTax, notary, nhgPremium, closingFlat },
    };
  },
  monthlyExtras: (): MonthlyExtras => ({ countryAdj: 0 }),
  monthlyPropertyTax: (input, ctx): number => {
    const i = input as NLInputs;
    // OZB on WOZ; WOZ drifts at wozGrowthPct/yr.
    const woz = escalate(i.wozValue, i.wozGrowthPct, ctx.yearIndex);
    return (i.ozbRate * woz) / 12;
  },
  annualBuyTax: (input, ctx): AnnualBuyTaxResult => {
    const i = input as NLInputs;
    const y0 = ctx.yearIndex - 1;
    // WOZ drifts independently of market value at wozGrowthPct/yr.
    const woz = escalate(i.wozValue, i.wozGrowthPct, y0);
    // Eigenwoningforfait
    const ewf = woz <= i.ewfHighThreshold
      ? woz * i.ewfRateLow
      : i.ewfHighThreshold * i.ewfRateLow + (woz - i.ewfHighThreshold) * i.ewfRateHigh;

    // HRA: deductible at min(marginal, ceiling). Only for annuity (interestOnly OFF).
    const hraRate = Math.min(i.marginalRate, i.hraCeilingRate);
    const hraDeduction = i.interestOnly ? 0 : hraRate * ctx.interestPaidYear;
    const ewfAddBack = i.marginalRate * ewf;

    // Year-1 one-off: financing-related costs are deductible from Box 1 income
    // in the year of purchase — the mortgage-related portion of the notary +
    // advisor + valuation bundle, plus the NHG premium in full. Only applies
    // for HRA-eligible (annuity) products.
    let oneOffDeduction = 0;
    if (ctx.yearIndex === 1 && !i.interestOnly) {
      const notaryBundle = i.notaryAdvisorPct * i.homePrice;
      const nhgPremium =
        i.nhg && i.homePrice <= i.nhgThreshold
          ? i.nhgPremiumPct * (i.homePrice - i.homePrice * i.downPaymentPct)
          : 0;
      const deductibleClosing =
        i.notaryDeductiblePortion * notaryBundle + nhgPremium;
      oneOffDeduction = i.marginalRate * deductibleClosing;
    }

    // Net effect: HRA + one-off reduce tax (negative cash effect), EWF increases it.
    const netCashEffect = -hraDeduction - oneOffDeduction + ewfAddBack;
    return {
      netCashEffect,
      breakdown: { ewf, hraDeduction, oneOffDeduction, ewfAddBack, hraRate },
    };
  },
  annualPortfolioDrag: (input, buyBucket, rentBucket, ctx): AnnualPortfolioDragResult => {
    const i = input as NLInputs;
    const y0 = (ctx?.yearIndex ?? 1) - 1;
    const baseThreshold = escalate(i.box3Threshold, i.box3ThresholdGrowthPct, y0);
    const threshold = i.partnered ? baseThreshold * 2 : baseThreshold;
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
