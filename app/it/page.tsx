import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rent vs Buy in Italy",
  description:
    "Should you rent or buy in Italy? Prima-casa registration tax, mutuo deduction, bollo, and equity-vs-bond CGT.",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Rent vs Buy Calculator: Italy",
  description:
    "Calculator that compares renting and buying in Italy after taxes, including prima-casa imposta di registro, the 19% mutuo interest credit, bollo on the renter's portfolio, and the equity-vs-government-bond capital-gains split.",
  url: `${SITE_URL}/it`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

export default function ITPage() {
  return (
    <>
      <JsonLd data={schema} />
      <section className="prose prose-sm dark:prose-invert max-w-none pb-2">
        <p>
          Compare renting and buying in Italy after taxes: prima casa registration,
          the 19% mutuo interest credit, bollo on the renter's portfolio, and the
          26% / 12.5% capital-gains split for equity ETFs vs government bonds. Read
          the in-depth <a href="/guides/rent-vs-buy-italy">Italy guide</a> for a
          worked example.
        </p>
      </section>
      <Calculator country="it" currency="EUR" />
      <section className="prose prose-sm dark:prose-invert max-w-none pt-10">
        <h2>How this Italian calculator works</h2>
        <p>
          The Italian version assumes prima casa, non-luxury (categoria A/2 to A/7),
          purchased from a private seller, the most common case. One-time costs
          include 2% imposta di registro on the cadastral value (rendita catastale ×
          coefficient, which you enter directly), €100 in fixed imposta ipotecaria +
          catastale, notary fees, and real estate agent commission with 22% IVA.
          Annual buy-side effects include the 19% mutuo interest credit capped at
          €4,000 of interest paid, while IMU is exempt for prima casa.
        </p>
        <p>
          The renter's portfolio is taxed at 0.2% bollo annually on its market value,
          and at realisation Italian rules split the rate: 26% on equity-ETF gains
          and 12.5% on Italian and EU government bond gains. The simulator tracks
          cost basis per bucket so the year-end CGT haircut on the renter's net
          worth reflects the actual mix of equity and bonds in the portfolio.
        </p>
        <p>
          Inputs cover home price, cadastral value, down payment, mutuo rate and
          term, notary and agent fees, TARI, and your equity/bond split. See the{" "}
          <a href="/methodology">Methodology</a> page for the worked rules and the
          year-end math.
        </p>
      </section>
    </>
  );
}
