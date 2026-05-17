import { escalate } from "../core/escalate";
import {
  bucketBasis,
  bucketTotal,
  unrealizedGain,
  type BucketState,
} from "../core/portfolio";
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

    // Counterfactual: conventional realization-based CGT means NO annual
    // wealth/return tax — the whole charge is deferred to horizon (see
    // unrealizedCGT below).
    if (i.box3Mode === "realized-cgt") {
      return { buyDrag: 0, rentDrag: 0, breakdown: { threshold: 0 } };
    }

    const y0 = (ctx?.yearIndex ?? 1) - 1;
    const baseThreshold = escalate(i.box3Threshold, i.box3ThresholdGrowthPct, y0);
    const threshold = i.partnered ? baseThreshold * 2 : baseThreshold;

    if (i.box3Mode === "actual-2028") {
      // Vermogensaanwasbelasting: tax the year's ACTUAL accrual (realized +
      // unrealized) at box3TaxRate. The tax-free allowance is modeled the same
      // way as the deemed system — only the fraction of the portfolio above
      // the allowance is in scope. Basis is marked to market afterwards (see
      // simulate.ts) so each year only taxes that year's accrual.
      const accrualTax = (b: BucketState) => {
        const val = bucketTotal(b);
        if (val <= 0) return 0;
        const gain = Math.max(0, val - bucketBasis(b));
        const taxableFraction = Math.max(0, val - threshold) / val;
        return gain * taxableFraction * i.box3TaxRate;
      };
      return {
        buyDrag: accrualTax(buyBucket),
        rentDrag: accrualTax(rentBucket),
        markToMarketBuy: true,
        markToMarketRent: true,
        breakdown: { threshold },
      };
    }

    // deemed-2025 (default): deemed yield × rate on wealth above the allowance.
    const deemedTax = (val: number) => {
      const taxable = Math.max(0, val - threshold);
      return taxable * i.box3DeemedYield * i.box3TaxRate;
    };
    return {
      buyDrag: deemedTax(bucketTotal(buyBucket)),
      rentDrag: deemedTax(bucketTotal(rentBucket)),
      breakdown: { threshold },
    };
  },
  unrealizedCGT: (input, buyBucket, rentBucket): RealizationCGT => {
    const i = input as NLInputs;
    // Only the counterfactual realized-CGT regime levies at realization. The
    // deemed and 2028-accrual regimes already taxed the portfolio annually, so
    // there is no horizon haircut (no double-count).
    if (i.box3Mode !== "realized-cgt") return { buyCGT: 0, rentCGT: 0 };
    const buyG = unrealizedGain(buyBucket);
    const rentG = unrealizedGain(rentBucket);
    return {
      buyCGT: buyG.total * i.box3CgtRate,
      rentCGT: rentG.total * i.box3CgtRate,
    };
  },
};
