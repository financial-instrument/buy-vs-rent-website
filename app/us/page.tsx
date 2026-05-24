import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
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
  name: "Rent vs Buy Calculator: United States",
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
      <section className="prose prose-sm dark:prose-invert max-w-none pb-2">
        <p>
          Compare renting and buying in the US after taxes: the mortgage interest
          deduction, the SALT cap on property and state-local taxes, PMI while LTV is
          above 80%, and capital-gains tax on the renter's investment portfolio. Read
          the in-depth{" "}
          <a href="/guides/rent-vs-buy-united-states">United States guide</a> for a
          worked example.
        </p>
      </section>
      <Calculator country="us" currency="USD" />
      <section className="prose prose-sm dark:prose-invert max-w-none pt-10">
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
          Once a year, the buyer's tax effects (the mortgage interest deduction
          benefit when itemising clears the standard deduction, PMI dropping off as
          equity grows, and property tax up to the SALT cap) are netted into the cash
          flow so next year's differential reflects them. The result is a year-by-year
          net-worth curve for both sides over your chosen horizon. The shared
          opportunity-cost framing behind every country (both sides starting from the
          same liquid wealth, the lower-outflow side investing the difference) is
          explained in{" "}
          <a href="/guides/why-rent-vs-buy-calculators-are-wrong">
            why most rent-vs-buy calculators are wrong
          </a>
          .
        </p>
        <p>
          Use the inputs to set your home price, down payment, mortgage rate and
          term, federal marginal tax rate, state and local income tax rate, and the
          expected return on a stock/bond portfolio. The full methodology, including
          parameter sources for the 2025 standard deduction and SALT cap, is on the{" "}
          <a href="/methodology">Methodology</a> page.
        </p>
      </section>
    </>
  );
}
