import { escalate } from "../core/escalate";
import { unrealizedGain } from "../core/portfolio";
import type {
  AnnualBuyTaxResult,
  AnnualPortfolioDragResult,
  CountryRules,
  MonthlyExtras,
  OneTimeCosts,
  RealizationCGT,
} from "../core/rules";
import type { CountryInputs, USInputs } from "../core/types";
import { usDefaults } from "./defaults";

const NIIT_RATE = 0.038;

export const usRules: CountryRules = {
  defaults: () => usDefaults(),
  effectiveRate: (input: CountryInputs) => input.mortgageRate,
  oneTimeCosts: (input: CountryInputs): OneTimeCosts => {
    const i = input as USInputs;
    const closing = i.homePrice * i.closingCostsPct;
    return { closingTotal: closing, breakdown: { closing } };
  },
  monthlyExtras: (): MonthlyExtras => ({ countryAdj: 0 }),
  monthlyPropertyTax: (input, ctx): number => {
    const i = input as USInputs;
    return (i.propertyTaxRate * ctx.homeValue) / 12;
  },
  annualBuyTax: (input, ctx): AnnualBuyTaxResult => {
    const i = input as USInputs;
    const y0 = ctx.yearIndex - 1; // year 1 → base, year N → (1+g)^(N-1)
    const acqCap = escalate(i.acquisitionDebtCap, i.acquisitionDebtCapGrowthPct, y0);
    const saltCap = escalate(i.saltCap, i.saltCapGrowthPct, y0);
    const standardSingle = escalate(
      i.standardDeductionSingle,
      i.standardDeductionGrowthPct,
      y0,
    );
    const standardMFJ = escalate(i.standardDeductionMFJ, i.standardDeductionGrowthPct, y0);
    const stateIncomeTax = 0; // We don't model income; SALT cap covers state income tax + property tax.
    const deductibleRatio = ctx.avgLoanBalanceYear > 0
      ? Math.min(1, acqCap / ctx.avgLoanBalanceYear)
      : 0;
    const deductibleInterest = ctx.interestPaidYear * deductibleRatio;
    const saltUncapped = ctx.propertyTaxYear + stateIncomeTax;
    const saltCapped = Math.min(saltUncapped, saltCap);
    const itemized = deductibleInterest + saltCapped;
    const standard = i.filing === "mfj" ? standardMFJ : standardSingle;
    const benefitBase = Math.max(0, itemized - standard);
    const midBenefit = i.federalMarginalRate * benefitBase;
    // MID benefit is a tax SAVING for the buyer → negative cash effect.
    return {
      netCashEffect: -midBenefit,
      breakdown: { deductibleInterest, saltCapped, itemized, standard, midBenefit },
    };
  },
  annualPortfolioDrag: (): AnnualPortfolioDragResult => ({
    buyDrag: 0,
    rentDrag: 0,
    breakdown: {},
  }),
  unrealizedCGT: (input, buyBucket, rentBucket): RealizationCGT => {
    const i = input as USInputs;
    const rate = i.ltcgRate + (i.niit ? NIIT_RATE : 0);
    const buyG = unrealizedGain(buyBucket).total;
    const rentG = unrealizedGain(rentBucket).total;
    return { buyCGT: buyG * rate, rentCGT: rentG * rate };
  },
};
