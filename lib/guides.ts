import type { Country } from "@/lib/calc/core/types";

export interface Guide {
  /** URL slug under /guides */
  slug: string;
  title: string;
  /** One-line summary used on the index and in <meta description>. */
  description: string;
  /** Optional country this guide pairs with (drives the calculator CTA). */
  country?: Country;
  /** Grouping on the index page. */
  group: "country" | "concept";
  /** Rough reading time, e.g. "9 min". */
  readingTime: string;
  /** ISO date the guide was last reviewed. */
  updated: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "rent-vs-buy-netherlands",
    title:
      "Renting vs buying in the Netherlands (2026): HRA, Box 3, transfer tax and NHG",
    description:
      "How Hypotheekrenteaftrek, the Eigenwoningforfait, the 2% transfer tax, NHG and Box 3 wealth tax change the rent-vs-buy maths for Dutch households, with a worked example.",
    country: "nl",
    group: "country",
    readingTime: "11 min",
    updated: "2026-05-24",
  },
  {
    slug: "rent-vs-buy-united-states",
    title:
      "Renting vs buying in the United States (2026): the mortgage interest deduction, SALT cap, PMI and capital gains",
    description:
      "Why the standard deduction, the SALT cap, PMI and long-term capital-gains tax decide the American rent-vs-buy question more than the headline mortgage rate does.",
    country: "us",
    group: "country",
    readingTime: "12 min",
    updated: "2026-05-24",
  },
  {
    slug: "rent-vs-buy-italy",
    title:
      "Renting vs buying in Italy (2026): prima casa, the mutuo credit, bollo and capital gains",
    description:
      "Prima-casa registration tax on the cadastral value, the 19% mutuo interest credit, the bollo wealth tax and Italy's 26%/12.5% capital-gains split, and what they do to renting vs buying.",
    country: "it",
    group: "country",
    readingTime: "11 min",
    updated: "2026-05-24",
  },
  {
    slug: "why-rent-vs-buy-calculators-are-wrong",
    title: "Why most rent-vs-buy calculators are wrong",
    description:
      "Comparing a mortgage payment to a rent cheque ignores the renter's down payment and the buyer's after-tax cost. Here is the opportunity-cost framing that fixes both.",
    group: "concept",
    readingTime: "9 min",
    updated: "2026-05-24",
  },
  {
    slug: "capital-gains-tax-and-rent-vs-buy",
    title: "How capital-gains tax quietly changes the rent-vs-buy answer",
    description:
      "A renter who invests the down payment owes tax on the gains; a homeowner usually does not. How US LTCG, Italy's 26%/12.5% split and Dutch Box 3 reshape the comparison.",
    group: "concept",
    readingTime: "10 min",
    updated: "2026-05-24",
  },
  {
    slug: "box3-2028-reform-explained",
    title: "The Netherlands' Box 3 2028 reform, explained",
    description:
      "From a deemed-return levy to a tax on actual returns: what the 2028 Box 3 reform changes for savers and investors, and why it tilts the rent-vs-buy decision.",
    group: "concept",
    readingTime: "10 min",
    updated: "2026-05-24",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
