export type Country = "us" | "nl" | "it";
export type Currency = "USD" | "EUR";

export interface UniversalInputs {
  homePrice: number;
  downPaymentPct: number; // 0..1
  mortgageRate: number; // annual nominal, e.g. 0.065
  termYears: number;
  horizonYears: number;
  closingCostsPct: number; // 0..1, of price
  closingCostsFlat: number; // absolute amount: overbid, notary fees not captured by itemized rates, valuation, moving, etc.
  saleCostsPct: number; // 0..1, of home value at sale (subtracted from buy net worth)
  appreciationPct: number; // annual nominal
  maintenancePct: number; // annual % of value
  insuranceAnnual: number;
  hoaMonthly: number;
  monthlyRent: number;
  rentInflationPct: number;
  cpiPct: number;
  equityReturnPct: number;
  bondReturnPct: number;
  equitySplit: number; // 0..1 portion in equity
}

export interface USInputs extends UniversalInputs {
  country: "us";
  filing: "single" | "mfj";
  householdIncomeAnnual: number; // drives the state-income leg of SALT
  stateLocalIncomeRate: number; // 0..1, applied to householdIncomeAnnual
  federalMarginalRate: number; // 0..1
  propertyTaxRate: number; // 0..1 of value
  pmiRate: number; // 0..1 of original loan
  standardDeductionSingle: number;
  standardDeductionMFJ: number;
  saltCap: number; // 10_000
  acquisitionDebtCap: number; // 750_000
  ltcgRate: number; // 0..1
  niit: boolean;
  // Policy-simulation: annual growth applied to inflation-indexed thresholds.
  standardDeductionGrowthPct: number;
  saltCapGrowthPct: number;
  acquisitionDebtCapGrowthPct: number;
}

export interface NLInputs extends UniversalInputs {
  country: "nl";
  wozValue: number;
  partnered: boolean;
  marginalRate: number; // 0..1
  hraCeilingRate: number; // 0..1, ~0.3697
  ozbRate: number; // 0..1 of WOZ
  ewfRateLow: number; // 0.0035
  ewfRateHigh: number; // 0.0235
  ewfHighThreshold: number; // 1_310_000
  box3Threshold: number; // 57_000 single
  box3DeemedYield: number; // ~0.06
  box3TaxRate: number; // 0.36
  transferTaxRate: number; // 0.02
  firstTimeBuyer: boolean;
  firstTimeBuyerThreshold: number;
  notaryAdvisorPct: number; // ~0.015
  // Fraction of (notary + advisor + valuation) that is mortgage-related and
  // therefore deductible from Box 1 income in the year of purchase. NHG
  // premium is always deductible in full.
  notaryDeductiblePortion: number; // 0..1, default ~0.6
  nhg: boolean;
  nhgThreshold: number;
  nhgPremiumPct: number;
  nhgRateReductionBps: number;
  interestOnly: boolean;
  // Policy-simulation growth knobs (apply to recurring annual params only).
  box3ThresholdGrowthPct: number;
  wozGrowthPct: number; // WOZ drifts independently of market home value
}

export interface ITInputs extends UniversalInputs {
  country: "it";
  cadastralValue: number;
  notaryPct: number;
  agentPct: number;
  agentIvaPct: number;
  tariAnnual: number;
  registrationTaxRate: number; // 0.02 prima casa
  fixedIpotecariaCatastale: number; // 200
  mutuoStampTaxRate: number; // 0.0025 — imposta sostitutiva sul mutuo, prima casa
  bolloRate: number; // 0.002
  mutuoDeductionRate: number; // 0.19
  mutuoInterestCap: number; // 4000
  equityCgtRate: number; // 0.26
  bondCgtRate: number; // 0.125
  // Policy-simulation growth knobs.
  mutuoInterestCapGrowthPct: number;
}

export type CountryInputs = USInputs | NLInputs | ITInputs;

export interface MonthlyState {
  month: number;
  year: number;
  loanBalance: number;
  homeValue: number;
  monthlyRent: number;
  buyOutflow: number;
  rentOutflow: number;
  buyPortfolio: number;
  rentPortfolio: number;
  buyBasis: number;
  rentBasis: number;
  buyEquityValue: number;
  buyBondValue: number;
  rentEquityValue: number;
  rentBondValue: number;
  buyEquityBasis: number;
  buyBondBasis: number;
  rentEquityBasis: number;
  rentBondBasis: number;
  // Monthly breakdown of buy outflow (for display / charts).
  // pi = principal + interest (full mortgage payment); kept for back-compat consumers.
  // buyInvest / rentInvest = amount contributed to that side's portfolio this month
  // (whichever side has lower outflow invests the differential).
  components: {
    pi: number;
    principal: number;
    interest: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    pmi: number;
    countryAdj: number;
    buyInvest: number;
    rentInvest: number;
  };
}

export interface YearlySnapshot {
  year: number;
  loanBalance: number;
  homeValue: number;
  buyPortfolio: number;
  rentPortfolio: number;
  buyNetWorth: number; // (V - L - saleCosts) + buyPortfolio
  rentNetWorth: number; // rentPortfolio − unrealizedCGT
  rentUnrealizedCGT: number;
  annualBuyTaxEffect: number; // negative = refund (reduces outflow)
  annualPortfolioDrag: number; // taxes paid on portfolios
  totalBuyOutflowYear: number;
  totalRentOutflowYear: number;
}

export interface SimulationResult {
  monthly: MonthlyState[];
  yearly: YearlySnapshot[];
  // t=0 snapshot: buyer's home equity (= down payment) vs renter's invested W0.
  // Their difference is exactly the buy-side closing costs — the friction the
  // buyer eats up front (agents, notary, transfer/registration tax, NHG premium…).
  yearZero: { buyNetWorth: number; rentNetWorth: number; closingCostsPenalty: number };
  inputs: CountryInputs;
  W0: number; // initial liquid wealth
  loanPrincipal: number;
  monthlyPayment: number;
  finalBuyNetWorth: number;
  finalRentNetWorth: number;
  delta: number; // buy − rent
  winner: "buy" | "rent" | "tie";
}
