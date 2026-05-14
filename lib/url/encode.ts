// URL encoding for calculator state.
//
// Compact format: each field gets a 2-char key. Numbers are stringified;
// booleans are 1/0. The full schema lives alongside the calculator types
// (lib/schema/*) — encode.ts just stitches the form values into a query string.

import type { CountryInputs, ITInputs, NLInputs, USInputs } from "@/lib/calc/core/types";

const COMMON_KEYS: Array<[keyof CountryInputs, string]> = [
  ["homePrice", "hp"],
  ["downPaymentPct", "dp"],
  ["mortgageRate", "mr"],
  ["termYears", "tm"],
  ["horizonYears", "hz"],
  ["closingCostsPct", "cc"],
  ["saleCostsPct", "sl"],
  ["appreciationPct", "ap"],
  ["maintenancePct", "mn"],
  ["insuranceAnnual", "in"],
  ["hoaMonthly", "ho"],
  ["monthlyRent", "rt"],
  ["rentInflationPct", "ri"],
  ["cpiPct", "cp"],
  ["equityReturnPct", "er"],
  ["bondReturnPct", "br"],
  ["equitySplit", "es"],
];

const US_KEYS: Array<[keyof USInputs, string]> = [
  ["filing", "fl"],
  ["householdIncomeAnnual", "hi"],
  ["stateLocalIncomeRate", "si"],
  ["federalMarginalRate", "fr"],
  ["propertyTaxRate", "pt"],
  ["pmiRate", "pi"],
  ["standardDeductionSingle", "ds"],
  ["standardDeductionMFJ", "dm"],
  ["saltCap", "sc"],
  ["acquisitionDebtCap", "ad"],
  ["ltcgRate", "lt"],
  ["niit", "ni"],
  ["standardDeductionGrowthPct", "gs"],
  ["saltCapGrowthPct", "gc"],
  ["acquisitionDebtCapGrowthPct", "ga"],
];

const NL_KEYS: Array<[keyof NLInputs, string]> = [
  ["wozValue", "wo"],
  ["partnered", "pa"],
  ["marginalRate", "mg"],
  ["hraCeilingRate", "hc"],
  ["ozbRate", "oz"],
  ["ewfRateLow", "el"],
  ["ewfRateHigh", "eh"],
  ["ewfHighThreshold", "et"],
  ["box3Threshold", "b3"],
  ["box3DeemedYield", "by"],
  ["box3TaxRate", "bt"],
  ["transferTaxRate", "tt"],
  ["firstTimeBuyer", "fb"],
  ["firstTimeBuyerThreshold", "ft"],
  ["notaryAdvisorPct", "na"],
  ["notaryDeductiblePortion", "nd"],
  ["nhg", "nh"],
  ["nhgThreshold", "nt"],
  ["nhgPremiumPct", "np"],
  ["nhgRateReductionBps", "nr"],
  ["interestOnly", "io"],
  ["box3ThresholdGrowthPct", "gb"],
  ["wozGrowthPct", "gw"],
];

const IT_KEYS: Array<[keyof ITInputs, string]> = [
  ["cadastralValue", "cv"],
  ["notaryPct", "no"],
  ["agentPct", "ag"],
  ["agentIvaPct", "iv"],
  ["tariAnnual", "ta"],
  ["registrationTaxRate", "rg"],
  ["fixedIpotecariaCatastale", "ic"],
  ["mutuoStampTaxRate", "ms"],
  ["bolloRate", "bo"],
  ["mutuoDeductionRate", "md"],
  ["mutuoInterestCap", "mc"],
  ["equityCgtRate", "ec"],
  ["bondCgtRate", "bc"],
  ["mutuoInterestCapGrowthPct", "gm"],
];

function encodeValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(+v.toFixed(6));
  return String(v);
}

export function encode(input: CountryInputs): string {
  const params = new URLSearchParams();
  for (const [k, short] of COMMON_KEYS) {
    params.set(short, encodeValue((input as unknown as Record<string, unknown>)[k as string]));
  }
  if (input.country === "us") {
    for (const [k, short] of US_KEYS) params.set(short, encodeValue((input as unknown as Record<string, unknown>)[k as string]));
  } else if (input.country === "nl") {
    for (const [k, short] of NL_KEYS) params.set(short, encodeValue((input as unknown as Record<string, unknown>)[k as string]));
  } else if (input.country === "it") {
    for (const [k, short] of IT_KEYS) params.set(short, encodeValue((input as unknown as Record<string, unknown>)[k as string]));
  }
  return params.toString();
}

export const SHORT_KEYS = { COMMON_KEYS, US_KEYS, NL_KEYS, IT_KEYS };
