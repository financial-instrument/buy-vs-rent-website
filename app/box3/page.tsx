import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Box 3 and the 2028 reform",
  description:
    "How the Dutch Box 3 wealth tax — and the proposed 2028 actual-return reform — tax the renter's portfolio while owner-occupied housing sits in the lightly-taxed Box 1, and what that does to the rent-vs-buy decision.",
};

// This page deliberately renders no calculator and no ad units. It carries an
// opinion + outbound campaign links; keeping it off the ad-bearing surfaces
// avoids tangling advocacy CTAs with AdSense.
export default function Box3Page() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>Box 3, the 2028 reform, and the rent-vs-buy tilt</h1>

      <p>
        This page explains how the Dutch <strong>Box 3</strong> wealth tax — and the
        reform planned for <strong>2028</strong> — interact with the decision to rent
        or buy. The first part is factual. The opinion, and the campaign links, are in
        a clearly marked section at the end. You can test every claim here yourself in
        the <Link href="/nl">Netherlands calculator</Link> using the{" "}
        <em>Box&nbsp;3 regime</em> selector.
      </p>

      <h2>The three regimes the calculator can model</h2>
      <p>
        The NL calculator taxes the renter&apos;s investment portfolio under one of
        three regimes. You switch between them with the <em>Box&nbsp;3 regime</em>
        dropdown; everything else stays fixed, so the difference you see is purely the
        tax regime.
      </p>
      <ul>
        <li>
          <strong>2025 deemed yield (current).</strong> The transitional system in
          force today: tax is levied on a <em>fictional</em> (deemed) return applied
          to wealth above a tax-free allowance, at a flat rate — regardless of what
          your portfolio actually earned.
        </li>
        <li>
          <strong>2028 actual return (proposed).</strong> The government&apos;s
          planned <em>vermogensaanwasbelasting</em> (&quot;wealth-accrual tax&quot;):
          tax on your <em>actual</em> yearly return, including <em>unrealised</em>{" "}
          appreciation you have not sold. This is a real, proposed change to Dutch
          law, currently slated to take effect in 2028.
        </li>
        <li>
          <strong>Realized CGT (counterfactual — not a Dutch proposal).</strong> For
          comparison only: a conventional capital-gains tax, levied once, on the gain,
          when you sell — the model used by most countries. The Netherlands has{" "}
          <em>no</em> general capital-gains tax on private investments today, and this
          is <em>not</em> on the table. It is included purely as a neutral yardstick
          so you can see how the Dutch regimes compare to an ordinary one.
        </li>
      </ul>

      <h2>Why this skews the rent-vs-buy choice</h2>
      <p>
        Owner-occupied housing is not in Box 3. It sits in <strong>Box 1</strong>,
        taxed through the Eigenwoningforfait with mortgage interest deductible via
        Hypotheekrenteaftrek — a comparatively light treatment. A renter who instead
        invests the equivalent of a down payment is taxed in Box 3, year after year,
        on the way up.
      </p>
      <p>
        The size of that asymmetry is <em>conditional</em>, and the calculator will
        show you both directions honestly: for a modest portfolio over a short
        horizon, a one-off realization CGT can actually be the harsher of the regimes;
        but for a sizeable portfolio compounding over a long horizon, the annual
        wealth tax — and the 2028 accrual version in particular, because it also taxes
        gains you have not realised — erodes the renter&apos;s position substantially
        more than a conventional CGT would. Over a long horizon that widens the
        buy-minus-rent gap and, at the level of the whole market, is part of what
        channels capital into owner-occupied property and away from other saving.
      </p>
      <p>
        Try it: open the{" "}
        <Link href="/nl?hz=30&tm=30&bm=actual-2028">
          Netherlands calculator at a 30-year horizon in the 2028 regime
        </Link>{" "}
        and flip the <em>Box&nbsp;3 regime</em> dropdown between the three options.
        Adjust the inputs to your own situation rather than trusting a pre-set
        scenario — the point is that you can check it.
      </p>

      <h2 id="opinion">Our position (opinion)</h2>
      <p>
        <em>
          The following is the opinion of this site&apos;s author, clearly separated
          from the factual material above. The calculator itself does not take a
          position; it just runs the numbers.
        </em>
      </p>
      <p>
        We oppose the 2028 actual-return reform as drafted. Taxing unrealised gains
        annually penalises ordinary savers and long-horizon investors — disproportionately
        renters building wealth outside of housing — while leaving owner-occupied
        property in its lighter Box 1 treatment. We believe this deepens the existing
        tilt toward buying and adds further pressure to property prices, and that a
        conventional realization-based capital-gains tax would be fairer and less
        distortionary.
      </p>
      <p>If you share this view, two campaigns are organising against it:</p>
      <ul>
        <li>
          <a
            href="https://vermogensval.nl/"
            target="_blank"
            rel="noopener noreferrer"
          >
            vermogensval.nl
          </a>{" "}
          — campaign and background on the proposed reform.
        </li>
        <li>
          <a
            href="https://box3eerlijk.petities.nl/"
            target="_blank"
            rel="noopener noreferrer"
          >
            box3eerlijk.petities.nl
          </a>{" "}
          — petition for a fairer Box 3.
        </li>
      </ul>
      <p>
        For the exact mechanics the calculator implements, see the{" "}
        <Link href="/methodology">Methodology</Link> page. Tax rules are coded as of
        2025 and the 2028 design is still subject to legislative change — treat the
        projections as scenario analysis, not advice or a forecast.
      </p>
    </article>
  );
}
