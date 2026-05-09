import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
import { CalculatorSkeleton } from "@/components/calculator/CalculatorSkeleton";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rent vs Buy in the United States",
  description:
    "Should you rent or buy in the US? Side-by-side after-tax comparison with MID, SALT cap, PMI, and LTCG.",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rent vs Buy Calculator — United States",
  description:
    "Calculator that compares renting and buying in the US after taxes, including the mortgage interest deduction, SALT cap, PMI, and capital-gains tax on the renter's portfolio.",
  url: `${SITE_URL}/us`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function USPage() {
  return (
    <>
      <JsonLd data={schema} />
      <section className="prose prose-sm dark:prose-invert mx-auto max-w-3xl pb-2">
        <p>
          Compare renting and buying in the US after taxes — the mortgage interest
          deduction, the SALT cap on property and state-local taxes, PMI while LTV is
          above 80%, and capital-gains tax on the renter's investment portfolio. Both
          households start with the same liquid wealth; the lower-outflow side invests
          the difference each month.
        </p>
      </section>
      <Suspense fallback={<CalculatorSkeleton />}>
        <Calculator country="us" currency="USD" />
      </Suspense>
      <section className="prose prose-sm dark:prose-invert mx-auto max-w-3xl pt-10">
        <h2>How this US calculator works</h2>
        <p>
          The US version models a fixed-rate annuity mortgage, a year-by-year
          itemise-vs-standard-deduction decision (mortgage interest plus state and
          local taxes capped by the SALT cap), private mortgage insurance applied
          while loan-to-value exceeds 80%, and capital-gains tax on the renter's
          investment portfolio (long-term capital gains, with an optional 3.8% Net
          Investment Income Tax surcharge).
        </p>
        <p>
          Both households start with the same liquid wealth — the down payment plus
          buy-side closing costs. The buyer spends it on the house; the renter
          invests it. Each month, the lower-outflow side invests the difference. Once
          a year, the buyer's tax effects (the mortgage interest deduction benefit
          when itemising, PMI dropping off as equity grows, property tax up to the
          SALT cap) are netted into the cash flow so next year's differential
          reflects them. The result is a year-by-year net-worth curve for both sides
          over your chosen horizon.
        </p>
        <p>
          Use the inputs to set your home price, down payment, mortgage rate and
          term, federal marginal tax rate, state and local income tax rate, and the
          expected return on a stock/bond portfolio. The full methodology — including
          parameter sources for the 2025 standard deduction and SALT cap — is on the{" "}
          <a href="/methodology">Methodology</a> page.
        </p>
      </section>
    </>
  );
}
