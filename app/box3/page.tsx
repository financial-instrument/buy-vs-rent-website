import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Box 3 2028: our position",
  description:
    "Why this site opposes the Dutch Box 3 2028 actual-return reform as drafted, and links to the campaigns organising against it. The factual background lives in the Box 3 guide.",
};

// This page deliberately renders no calculator and no ad units. It carries an
// opinion + outbound campaign links; keeping it off the ad-bearing surfaces
// avoids tangling advocacy CTAs with AdSense. The factual explainer lives in
// the (ad-supported) guide at /guides/box3-2028-reform-explained.
export default function Box3Page() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>Box 3, the 2028 reform: our position</h1>

      <p>
        This page carries this site&apos;s <strong>opinion</strong> on the Dutch{" "}
        <strong>Box 3</strong> wealth tax and the reform planned for{" "}
        <strong>2028</strong>, along with links to the campaigns organising against
        it. The calculator itself takes no position; it just runs the numbers.
      </p>
      <p>
        For the <strong>factual background</strong> (what Box 3 is, why it is being
        reformed, how the deemed-return, actual-return and realised-gains regimes
        differ, and why it tilts the rent-vs-buy decision), see the{" "}
        <Link href="/guides/box3-2028-reform-explained">
          Box 3 2028 reform guide
        </Link>
        . You can test every claim yourself in the{" "}
        <Link href="/nl?hz=30&tm=30&bm=actual-2028">Netherlands calculator</Link>{" "}
        using the <em>Box&nbsp;3 regime</em> selector. Adjust the inputs to your own
        situation rather than trusting a pre-set scenario.
      </p>

      <h2 id="opinion">Our position</h2>
      <p>
        <em>
          The following is the opinion of this site&apos;s author. The calculator and
          the guides are factual; this section is not.
        </em>
      </p>
      <p>
        We oppose the 2028 actual-return reform as drafted. Taxing unrealised gains
        annually penalises ordinary savers and long-horizon investors,
        disproportionately renters building wealth outside of housing, while leaving
        owner-occupied property in its lighter Box 1 treatment. We believe this
        deepens the existing tilt toward buying and adds further pressure to property
        prices, and that a conventional realization-based capital-gains tax would be
        fairer and less distortionary.
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
          </a>
          : campaign and background on the proposed reform.
        </li>
        <li>
          <a
            href="https://box3eerlijk.petities.nl/"
            target="_blank"
            rel="noopener noreferrer"
          >
            box3eerlijk.petities.nl
          </a>
          : petition for a fairer Box 3.
        </li>
      </ul>
      <p>
        For the exact mechanics the calculator implements, see the{" "}
        <Link href="/methodology">methodology</Link> page. Tax rules are coded as of
        2025 and the 2028 design is still subject to legislative change, so treat the
        projections as scenario analysis, not advice or a forecast.
      </p>
    </article>
  );
}
