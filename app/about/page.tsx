import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the Rent vs Buy calculator and how it differs from naive rent-vs-equity tools.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>About</h1>
      <p>
        Most rent-vs-buy calculators compare the buyer's home equity against the renter's
        accumulated rent payments. That ignores the renter's biggest advantage —
        investing the down payment plus closing costs — and ignores the buyer's actual
        after-tax cost.
      </p>
      <p>
        This tool fixes both. Both households start with the same liquid wealth, the
        lower-outflow side invests the differential each month, and country-specific tax
        treatment is netted in once a year. Your country picks the rules; you pick
        everything else.
      </p>
      <p>
        Inputs are encoded in the URL — copy the share link from any country page to send
        a scenario to a friend.
      </p>
    </article>
  );
}
