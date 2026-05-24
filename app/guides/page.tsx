import Link from "next/link";
import type { Metadata } from "next";
import { GUIDES, type Guide } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "In-depth guides to the rent-vs-buy decision: country-by-country tax rules for the US, Netherlands and Italy, plus the economics most calculators get wrong.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  const country = GUIDES.filter((g) => g.group === "country");
  const concept = GUIDES.filter((g) => g.group === "concept");

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Guides</h1>
        <p className="text-muted-foreground">
          The rent-vs-buy decision turns on details that headline mortgage-vs-rent
          comparisons skip: the tax treatment of a home, the opportunity cost of a
          down payment, and the capital-gains bill a renter-investor eventually
          pays. These guides work through them, country by country, in the same
          terms the calculator models.
        </p>
      </header>

      <GuideSection title="Country guides" guides={country} />
      <GuideSection title="The economics" guides={concept} />
    </div>
  );
}

function GuideSection({ title, guides }: { title: string; guides: Guide[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul className="space-y-3">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className="block rounded-xl border p-5 transition-shadow hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="font-semibold">{g.title}</div>
              <p className="mt-1.5 text-sm text-muted-foreground">{g.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                {g.readingTime} read
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
