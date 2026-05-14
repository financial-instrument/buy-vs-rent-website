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
import type { CountryInputs, ITInputs } from "../core/types";
import { itDefaults } from "./defaults";

export const itRules: CountryRules = {
  defaults: () => itDefaults(),
  effectiveRate: (input) => input.mortgageRate,
  oneTimeCosts: (input, loanPrincipal): OneTimeCosts => {
    const i = input as ITInputs;
    const registro = i.registrationTaxRate * i.cadastralValue;
    const ipoCat = i.fixedIpotecariaCatastale;
    const notary = i.notaryPct * i.homePrice;
    const agentNet = i.agentPct * i.homePrice;
    const agentIva = agentNet * i.agentIvaPct;
    const agent = agentNet + agentIva;
    // Imposta sostitutiva sul mutuo: 0.25% × loan amount (prima casa).
    // Stamp tax — not deductible, paid at mortgage origination.
    const mutuoStampTax = i.mutuoStampTaxRate * loanPrincipal;
    const total = registro + ipoCat + notary + agent + mutuoStampTax;
    return {
      closingTotal: total,
      breakdown: { registro, ipoCat, notary, agent, mutuoStampTax },
    };
  },
  monthlyExtras: (input): MonthlyExtras => {
    // condominio is captured by hoaMonthly in the universal block; nothing extra here.
    void input;
    return { countryAdj: 0 };
  },
  monthlyPropertyTax: (input): number => {
    const i = input as ITInputs;
    // IMU exempt prima casa; TARI flat annual.
    return i.tariAnnual / 12;
  },
  annualBuyTax: (input, ctx): AnnualBuyTaxResult => {
    const i = input as ITInputs;
    const y0 = ctx.yearIndex - 1;
    const cap = escalate(i.mutuoInterestCap, i.mutuoInterestCapGrowthPct, y0);
    // Mutuo deduction: 19% × min(interestPaidYr, €4,000) credit (prima casa).
    const credit = i.mutuoDeductionRate * Math.min(ctx.interestPaidYear, cap);
    return {
      netCashEffect: -credit,
      breakdown: { credit },
    };
  },
  annualPortfolioDrag: (input, buyBucket, rentBucket): AnnualPortfolioDragResult => {
    const i = input as ITInputs;
    // Bollo 0.2% on portfolio market value.
    const buyVal = buyBucket.equityValue + buyBucket.bondValue;
    const rentVal = rentBucket.equityValue + rentBucket.bondValue;
    return {
      buyDrag: buyVal * i.bolloRate,
      rentDrag: rentVal * i.bolloRate,
      breakdown: {},
    };
  },
  unrealizedCGT: (input, buyBucket, rentBucket): RealizationCGT => {
    const i = input as ITInputs;
    const buyG = unrealizedGain(buyBucket);
    const rentG = unrealizedGain(rentBucket);
    return {
      buyCGT: buyG.equity * i.equityCgtRate + buyG.bond * i.bondCgtRate,
      rentCGT: rentG.equity * i.equityCgtRate + rentG.bond * i.bondCgtRate,
    };
  },
};
