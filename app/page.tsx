import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent vs Buy Calculator — US, Netherlands, Italy",
  description:
    "An honest rent-vs-buy calculator that accounts for opportunity cost and country-specific taxation. Choose US, Netherlands, or Italy.",
};

export default function Landing() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <section className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Should you rent or buy?</h1>
        <p className="text-lg text-muted-foreground">
          A calculator that takes opportunity cost and country-specific taxes seriously.
        </p>
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

      <section className="prose prose-sm dark:prose-invert max-w-none">
        <h2>How it works</h2>
        <p>
          Both households start with the same liquid wealth (down payment + closing costs).
          The renter invests that lump sum at <em>t = 0</em>. Each month, whichever side has
          the lower outflow invests the difference. After your chosen horizon, we compare
          the buy-side net worth (home equity + portfolio) against the rent-side net worth
          (portfolio − unrealized capital-gains tax).
        </p>
        <p>
          Country-specific taxes ripple through the buy-side cash flow once a year, so a
          Dutch HRA refund or an Italian mutuo deduction shows up where it belongs: as
          extra investable cash for the buyer.
        </p>
        <p>
          See the <Link href="/methodology">methodology page</Link> for the full math.
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
      className="block rounded-xl border p-5 transition-shadow hover:shadow-md"
    >
      <div className="text-3xl">{flag}</div>
      <div className="mt-2 font-semibold">{name}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </Link>
  );
}
