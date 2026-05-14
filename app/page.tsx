import Link from "next/link";
import type { Metadata } from "next";
import { HeroChart } from "@/components/landing/HeroChart";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator — US, Netherlands, Italy",
  description:
    "An honest rent-vs-buy calculator that accounts for opportunity cost and country-specific taxation. Choose US, Netherlands, or Italy.",
};

export default function Landing() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 py-6 sm:py-10">
      <section className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Should you rent or buy?
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            A calculator that takes opportunity cost and country-specific taxes
            seriously — the only honest way to settle the question.
          </p>
          <p className="text-sm text-muted-foreground">
            Pick a country to start. Every input is encoded in the URL so you can
            share a scenario, save it, or come back to it later.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3 shadow-sm">
          <div className="px-1 pb-1 text-xs text-muted-foreground">
            Net worth over time — illustrative scenario
          </div>
          <HeroChart />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <CountryCard
          href="/us"
          flag="🇺🇸"
          name="United States"
          subtitle="MID, SALT cap, PMI, LTCG"
        />
        <CountryCard
          href="/nl"
          flag="🇳🇱"
          name="Netherlands"
          subtitle="HRA, EWF, Box 3, NHG"
        />
        <CountryCard
          href="/it"
          flag="🇮🇹"
          name="Italy"
          subtitle="Prima casa, mutuo, bollo"
        />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            What this calculator actually models
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Most rent-vs-buy widgets compare a mortgage payment to a monthly rent.
            That answer is wrong — sometimes by hundreds of thousands of euros. The
            simulation here is built around a few principles that the alternatives
            ignore.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Pillar title="Opportunity cost is real">
            Both households start with the same liquid wealth — the down payment
            plus closing costs. The buyer spends it on the house; the renter
            invests it. Each month, whichever side has the lower outflow invests
            the difference. Whatever the renter would have paid in mortgage costs
            instead compounds in a stock/bond portfolio.
          </Pillar>
          <Pillar title="Country-specific taxes change the answer">
            Mortgage interest deduction (US), Hypotheekrenteaftrek &amp;
            Eigenwoningforfait (NL), the 19% mutuo credit (IT), Box 3 wealth tax,
            bollo, and capital-gains tax on the renter's portfolio (US LTCG, IT
            26% / 12.5% equity-vs-bond split) all net into the simulation once a
            year. Skipping these is the single biggest source of error in naive
            calculators.
          </Pillar>
          <Pillar title="Both sides use a consistent measuring stick">
            Buy net worth = home equity plus portfolio, with optional sale-side
            transaction costs you control. Rent net worth = portfolio net of
            country-specific capital-gains tax owed on liquidation. The two
            definitions are intentionally asymmetric and the methodology page
            explains why.
          </Pillar>
          <Pillar title="The inputs you actually have">
            Home price, down payment, mortgage rate, term, time horizon, expected
            stock/bond return, marginal tax rate, partnered status, NHG
            eligibility, filing status — the simulation exposes the levers you
            either know about yourself or can reasonably forecast. Defaults are
            seeded with realistic 2025 numbers per country.
          </Pillar>
        </div>

        <p className="text-sm text-muted-foreground">
          See the <Link className="underline" href="/methodology">methodology page</Link>{" "}
          for the formulas, the{" "}
          <Link className="underline" href="/about">about page</Link> for why this
          exists, or jump straight into a country above.
        </p>
      </section>
    </div>
  );
}

function CountryCard({
  href,
  flag,
  name,
  subtitle,
}: {
  href: string;
  flag: string;
  name: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border p-5 transition-shadow hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="text-3xl">{flag}</div>
      <div className="mt-2 font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </Link>
  );
}

function Pillar({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
