// Acronym / jargon dictionary used by the InfoLabel tooltips.
// Keep entries short (1–3 sentences). Lookup is by stable id, not by display label,
// so we can reword UI text without breaking the dictionary.

export interface GlossaryEntry {
  term: string;
  body: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // Universal
  ltv: {
    term: "LTV (loan-to-value)",
    body: "Outstanding loan balance divided by current home value. PMI typically applies until LTV drops below 80%.",
  },
  cpi: {
    term: "CPI (Consumer Price Index)",
    body: "General-inflation gauge. v1 displays it but doesn't yet show real (inflation-adjusted) net worth.",
  },

  // United States
  mid: {
    term: "MID (Mortgage Interest Deduction)",
    body: "Federal deduction for home mortgage interest, capped at the interest on $750k of acquisition debt. Only matters when itemizing beats the standard deduction.",
  },
  salt: {
    term: "SALT cap",
    body: "State And Local Taxes are deductible up to $10,000/year (combined property + state income). The cap is a per-year ceiling.",
  },
  pmi: {
    term: "PMI (Private Mortgage Insurance)",
    body: "Insurance the lender requires while LTV exceeds 80%. Charged as a % of the original loan amount, paid monthly.",
  },
  ltcg: {
    term: "LTCG (Long-Term Capital Gains tax)",
    body: "Federal rate on gains from assets held >1 year. Default 15% in v1; 0/15/20% bands aren't modeled.",
  },
  niit: {
    term: "NIIT (Net Investment Income Tax)",
    body: "3.8% federal surtax on investment income above income thresholds. Off by default.",
  },
  filing: {
    term: "Filing status",
    body: "Single vs Married Filing Jointly. Drives the standard deduction and (in real returns) the tax brackets.",
  },
  acquisitionDebtCap: {
    term: "Acquisition debt cap",
    body: "Only mortgage interest on the first $750k of principal is deductible. Larger loans get a pro-rated deduction.",
  },

  // Netherlands
  woz: {
    term: "WOZ value",
    body: "Annually-set municipal valuation of the home. Drives OZB property tax and Eigenwoningforfait. Usually trails market price by 6–12 months.",
  },
  ozb: {
    term: "OZB (Onroerendezaakbelasting)",
    body: "Municipal property tax, ~0.05–0.15% of WOZ depending on city. Paid yearly.",
  },
  ewf: {
    term: "Eigenwoningforfait",
    body: "Imputed rent: a small % of WOZ added to your taxable income because you 'consume' the home rather than renting it out. Currently 0.35% (2.35% above ~€1.31M).",
  },
  hra: {
    term: "HRA (Hypotheekrenteaftrek)",
    body: "Mortgage Interest Deduction. Available only on annuity / linear products; capped at the HRA ceiling rate (~36.97% for 2025), so high earners no longer deduct at their top marginal rate.",
  },
  nhg: {
    term: "NHG (Nationale Hypotheek Garantie)",
    body: "Government-backed mortgage guarantee for homes below the NHG threshold (~€435k). Costs a one-off premium (~0.6% of the loan) and reduces the rate the bank charges.",
  },
  box3: {
    term: "Box 3 (wealth tax)",
    body: "Annual tax on savings + investments above a tax-free threshold (~€57k single, ~€114k partnered). 2025 transition uses a deemed yield × 36% rate.",
  },
  box3Threshold: {
    term: "Box 3 tax-free threshold",
    body: "Per-person allowance below which Box 3 doesn't apply. Doubled for fiscal partners. The legislator usually indexes it for inflation — model that with the growth field below.",
  },
  partnered: {
    term: "Fiscal partner",
    body: "Married, registered partnership, or qualifying cohabitation. Doubles the Box 3 allowance.",
  },
  transferTax: {
    term: "Overdrachtsbelasting (transfer tax)",
    body: "2% one-off tax on the home price for owner-occupiers. First-time buyers under 35 buying below the threshold (~€525k) pay 0%.",
  },
  hraCeiling: {
    term: "HRA ceiling rate",
    body: "Maximum rate at which mortgage interest can be deducted, regardless of marginal bracket. ~36.97% for 2025.",
  },

  // Italy
  primaCasa: {
    term: "Prima casa",
    body: "First home / primary residence. Triggers reduced registration tax (2% on cadastral value), IMU exemption for non-luxury homes, and the 19% mutuo deduction.",
  },
  mutuo: {
    term: "Mutuo (mortgage)",
    body: "Italian fixed/variable-rate home loan. Interest paid in the year is partially deductible (19% × min(interest, €4,000) credit) for the prima casa.",
  },
  registro: {
    term: "Imposta di registro",
    body: "Registration tax: 2% × cadastral value for prima casa from a private seller (9% for seconda casa).",
  },
  ipoCat: {
    term: "Imposte ipotecaria + catastale",
    body: "Two fixed €50 fees for prima casa from a private seller. €100 total.",
  },
  cadastralValue: {
    term: "Valore catastale",
    body: "Rendita catastale × revaluation coefficient (typically 115.5 for prima casa). Used as the tax base for imposta di registro.",
  },
  iva: {
    term: "IVA",
    body: "Italian VAT. Real-estate agent fees attract 22% IVA on top of the agent's commission.",
  },
  imu: {
    term: "IMU",
    body: "Municipal property tax. Prima casa (non-luxury, A/2–A/7) is exempt, so we set it to 0 in v1.",
  },
  tari: {
    term: "TARI",
    body: "Municipal waste-collection tax. Flat annual amount in v1; defaults to €300.",
  },
  bollo: {
    term: "Bollo titoli",
    body: "0.2% annual stamp duty on financial-instrument account values. Bleeds out of the portfolio every year.",
  },
  mutuoCap: {
    term: "Mutuo deduction cap",
    body: "The 19% credit applies to at most €4,000 of interest per year. Ceiling above which extra interest no longer reduces tax.",
  },
};

export function lookup(id: string): GlossaryEntry | undefined {
  return GLOSSARY[id];
}
