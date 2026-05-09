import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "About the Rent vs Buy calculator and how it differs from naive rent-vs-equity tools.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>About</h1>

      <h2>Why this exists</h2>
      <p>
        I built this calculator because I needed it myself. Like many people in the
        Netherlands, I was trying to decide whether to keep renting or take on a
        mortgage, and I found that the available tools were either too narrow (US-style
        spreadsheet calculators ported to .nl with no real understanding of HRA, Box 3,
        or the Eigenwoningforfait), or too broad (generic "rent vs buy" widgets that
        ignore tax treatment entirely and just compare rent to mortgage payments).
        Nothing on the Dutch market combined a realistic mortgage amortisation, the
        actual annual tax effects of homeownership, and the renter's investment of the
        down payment in a single, transparent model.
      </p>
      <p>
        So I wrote one for myself, and then generalised it to two more tax regimes I
        have connections to — the United States and Italy — both of which have their
        own rules that off-the-shelf calculators routinely flatten or ignore.
      </p>

      <h2>What makes this calculator different</h2>
      <p>
        Most rent-vs-buy calculators compare the buyer's home equity against the
        renter's accumulated rent payments. That ignores the renter's biggest
        advantage — investing the down payment plus closing costs — and ignores the
        buyer's actual after-tax cost.
      </p>
      <p>
        This tool fixes both. Both households start with the same liquid wealth (down
        payment plus buy-side closing costs). At time zero, the buyer spends it on the
        house; the renter invests it. Each month afterwards, whichever side has the
        lower outflow invests the difference, and country-specific tax treatment is
        netted in once a year. The mortgage interest deduction (US),
        Hypotheekrenteaftrek and Eigenwoningforfait (NL), the 19% mutuo credit (IT),
        wealth taxes (Box 3 in the Netherlands, bollo in Italy), and capital-gains tax
        on the renter's portfolio (US LTCG, IT 26% / 12.5% split for equity vs
        government bonds) are all modelled in the year-end tick.
      </p>

      <h2>How net worth is defined</h2>
      <p>
        For the buyer: home value minus loan balance, plus any portfolio they have
        accumulated. We do <em>not</em> subtract sale-side transaction costs (agent,
        notary, transfer tax) — that gives an accounting view, not a "if I sold today"
        liquidation view. For the renter: portfolio value minus the country-specific
        capital-gains tax that would be owed on liquidation. The two definitions are
        intentionally asymmetric, to reflect the difference between an illiquid asset
        and a liquid one.
      </p>

      <h2>Inputs and sharing</h2>
      <p>
        Every input is encoded in the URL. Copy the share link from any country page
        to send a complete scenario to a friend, paste it into a doc, or come back to
        it later. Defaults are filled in for each country so you can land on a page
        and start exploring without supplying every parameter up front.
      </p>

      <h2>Limitations</h2>
      <p>
        This is a deterministic model with constant assumed returns and a single
        appreciation rate. It does not run Monte Carlo over investment outcomes, does
        not model refinancing or extra principal payments, and treats maintenance and
        insurance as flat fractions of value. Tax rules are coded as of 2025 and may
        change. See the <a href="/methodology">Methodology</a> page for the full math,
        and the <a href="/terms">Terms</a> for the obligatory disclaimer that this is
        an educational tool and not financial advice.
      </p>
    </article>
  );
}
