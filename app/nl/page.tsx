import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
import { CalculatorSkeleton } from "@/components/calculator/CalculatorSkeleton";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rent vs Buy in the Netherlands",
  description:
    "Should you rent or buy in the Netherlands? Models HRA, EWF, Box 3 wealth tax, NHG, and transfer tax.",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rent vs Buy Calculator — Netherlands",
  description:
    "Calculator that compares renting and buying in the Netherlands after taxes, including Hypotheekrenteaftrek, Eigenwoningforfait, OZB, the 2% transfer tax, NHG, and Box 3 wealth tax on the renter's portfolio.",
  url: `${SITE_URL}/nl`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function NLPage() {
  return (
    <>
      <JsonLd data={schema} />
      <section className="prose prose-sm dark:prose-invert mx-auto max-w-3xl pb-2">
        <p>
          Compare renting and buying in the Netherlands after taxes —
          Hypotheekrenteaftrek, the Eigenwoningforfait add-back, OZB, the 2% transfer
          tax with the optional starter exemption, NHG, and Box 3 wealth tax on the
          renter's portfolio. Both households start with the same liquid wealth; the
          lower-outflow side invests the difference each month.
        </p>
      </section>
      <Suspense fallback={<CalculatorSkeleton />}>
        <Calculator country="nl" currency="EUR" />
      </Suspense>
      <section className="prose prose-sm dark:prose-invert mx-auto max-w-3xl pt-10">
        <h2>How this Dutch calculator works</h2>
        <p>
          The Netherlands version handles the parts that generic rent-vs-buy tools
          usually skip: Hypotheekrenteaftrek (mortgage interest deduction, capped at
          the ~36.97% ceiling rate), the Eigenwoningforfait added back to taxable
          income, OZB on the WOZ value, the 2% transfer tax (overdrachtsbelasting)
          with the optional starter exemption, NHG eligibility and the rate discount
          it brings, and Box 3 wealth tax on the renter's portfolio above the
          per-person threshold (doubled if you toggle the partner option).
        </p>
        <p>
          Both households start with the same liquid wealth — down payment plus
          buy-side closing costs. The buyer spends it on the house; the renter
          invests it. Each month, the lower-outflow side invests the difference. Once
          a year, the net Dutch tax effect (HRA refund minus the EWF drag, plus the
          Box 3 hit on the renter's portfolio) is folded into the cash flow so the
          following year's differential reflects it.
        </p>
        <p>
          Inputs cover home price, down payment, mortgage rate and term, your
          marginal income tax rate, the partner toggle, NHG, and expected portfolio
          returns. WOZ defaults to the home price; edit it if your municipality's
          WOZ valuation differs. See the <a href="/methodology">Methodology</a> page
          for parameter sources and the per-year math.
        </p>
      </section>
    </>
  );
}
