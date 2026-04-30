export type Country = "us" | "nl" | "it";
export type Currency = "USD" | "EUR";

export interface UniversalInputs {
  homePrice: number;
  downPaymentPct: number; // 0..1
  mortgageRate: number; // annual nominal, e.g. 0.065
  termYears: number;
  horizonYears: number;
  closingCostsPct: number; // 0..1, of price
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
  stateLocalIncomeRate: number; // 0..1
  federalMarginalRate: number; // 0..1
  propertyTaxRate: number; // 0..1 of value
  pmiRate: number; // 0..1 of original loan
  standardDeductionSingle: number;
  standardDeductionMFJ: number;
  saltCap: number; // 10_000
  acquisitionDebtCap: number; // 750_000
  ltcgRate: number; // 0..1
  niit: boolean;
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
  nhg: boolean;
  nhgThreshold: number;
  nhgPremiumPct: number;
  nhgRateReductionBps: number;
  interestOnly: boolean;
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
  bolloRate: number; // 0.002
  mutuoDeductionRate: number; // 0.19
  mutuoInterestCap: number; // 4000
  equityCgtRate: number; // 0.26
  bondCgtRate: number; // 0.125
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
  // Monthly breakdown of buy outflow (for display / charts)
  components: {
    pi: number;
    propertyTax: number;
    insurance: number;
    hoa: number;
    maintenance: number;
    pmi: number;
    countryAdj: number;
  };
}

export interface YearlySnapshot {
  year: number;
  loanBalance: number;
  homeValue: number;
  buyPortfolio: number;
  rentPortfolio: number;
  buyNetWorth: number; // (V - L) + buyPortfolio (no sale costs/CGT in v1)
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
  inputs: CountryInputs;
  W0: number; // initial liquid wealth
  loanPrincipal: number;
  monthlyPayment: number;
  finalBuyNetWorth: number;
  finalRentNetWorth: number;
  delta: number; // buy − rent
  winner: "buy" | "rent" | "tie";
}
