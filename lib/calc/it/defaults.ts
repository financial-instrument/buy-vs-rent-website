import type { ITInputs } from "../core/types";

export const itDefaults = (): ITInputs => ({
  country: "it",
  homePrice: 300_000,
  downPaymentPct: 0.2,
  mortgageRate: 0.038,
  termYears: 25,
  horizonYears: 10,
  closingCostsPct: 0.06, // not used directly; broken out below
  closingCostsFlat: 0,
  saleCostsPct: 0,
  appreciationPct: 0.02,
  maintenancePct: 0.01,
  insuranceAnnual: 300,
  hoaMonthly: 100, // condominio
  monthlyRent: 1100,
  rentInflationPct: 0.02,
  cpiPct: 0.02,
  equityReturnPct: 0.07,
  bondReturnPct: 0.04,
  equitySplit: 0.7,
  cadastralValue: 80_000, // rendita catastale × coefficient (user enters directly)
  notaryPct: 0.015,
  agentPct: 0.03,
  agentIvaPct: 0.22,
  tariAnnual: 300,
  registrationTaxRate: 0.02,
  fixedIpotecariaCatastale: 100, // €50 + €50 prima casa, private seller
  mutuoStampTaxRate: 0.0025, // imposta sostitutiva sul mutuo, prima casa
  bolloRate: 0.002,
  mutuoDeductionRate: 0.19,
  mutuoInterestCap: 4_000,
  equityCgtRate: 0.26,
  bondCgtRate: 0.125,
  mutuoInterestCapGrowthPct: 0,
});
