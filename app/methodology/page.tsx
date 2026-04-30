import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How the rent-vs-buy calculator works: amortization, symmetric differential rule, and per-country tax treatment for the US, NL, and IT.",
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-sm dark:prose-invert mx-auto max-w-3xl py-6">
      <h1>Methodology</h1>

      <h2>Symmetric framing</h2>
      <p>
        Both households start with the same liquid wealth{" "}
        <strong>W₀ = down payment + buy-side closing costs</strong>. At <em>t = 0</em> the
        renter invests W₀; the buyer spends it on the purchase. Each month, the side with
        the lower outflow invests the differential. Annual tax effects (HRA refund, MID
        benefit, mutuo deduction, EWF add-back, Box 3 drag, IT bollo) are netted into the
        buy-side cash flow once a year so they ripple through the differential.
      </p>

      <h2>Net worth definitions (asymmetric on purpose)</h2>
      <ul>
        <li>
          <strong>Buy</strong>: <code>(V − L) + P_buy</code>. The accounting view of home
          equity plus portfolio. We do <em>not</em> subtract sale-side transaction costs or
          a notional home capital-gains tax — if you sold today, ~6–10% in agent/notary/
          transfer costs would come off.
        </li>
        <li>
          <strong>Rent</strong>: <code>P_rent − unrealizedCGT(P_rent)</code>. The
          country-specific capital-gains tax that would be owed on liquidation is subtracted
          (US LTCG ± NIIT, IT 26%/12.5%, NL 0% because Box 3 is paid annually).
        </li>
      </ul>

      <h2>Mortgage</h2>
      <p>
        Annuity (standard amortization): <code>M = L₀ · r / (1 − (1 + r)^−n)</code> with{" "}
        <code>r</code> = monthly rate, <code>n</code> = term in months. Monthly split:
        interest = balance × r; principal = M − interest.
      </p>

      <h2>Portfolio</h2>
      <p>
        Two buckets: equity ETF and government bonds, allocation slider, monthly returns
        via <code>(1 + annual)^(1/12) − 1</code>, annual rebalance to target. Cost basis is
        tracked per bucket so realization tax is computed correctly.
      </p>

      <hr />

      <h2 id="us">United States</h2>
      <ul>
        <li>Closing costs default 3% of price.</li>
        <li>Property tax = rate × home value (annual, applied monthly).</li>
        <li>PMI = pmiRate × original loan, while LTV &gt; 80%.</li>
        <li>
          <strong>Itemize vs standard each year.</strong> Itemized = deductible mortgage
          interest (interest scaled by min(1, $750k/avgBalance)) + min($10k SALT cap,
          property + state-local income). If itemized &gt; standard deduction (2025: $15k
          single / $30k MFJ), we apply the federal marginal rate to the excess.
        </li>
        <li>Realization tax on rent portfolio: LTCG rate (default 15%) + NIIT 3.8% if toggled.</li>
      </ul>

      <h2 id="nl">Netherlands</h2>
      <ul>
        <li>
          One-time: 2% transfer tax (overdrachtsbelasting), or 0% for first-time buyers
          below the threshold (~€525k); ~1.5% notary + advisor; NHG premium 0.6% of loan
          when applicable.
        </li>
        <li>Recurring: OZB ~0.1% × WOZ; Eigenwoningforfait at 0.35% of WOZ (2.35% above ~€1.31M).</li>
        <li>
          <strong>HRA:</strong> deductible at min(marginal rate, ceiling ≈ 36.97%) — only
          for annuity products. Net annual buy-side tax effect ={" "}
          <code>min(marginal, ceiling) × interestPaid − marginal × EWF</code>.
        </li>
        <li>
          <strong>Box 3:</strong> 2025 transition deemed yield × 36% on portfolio above the
          per-person threshold (~€57k single, doubled if partnered). v1 treats the whole
          portfolio as the "investments" bucket.
        </li>
      </ul>

      <h2 id="it">Italy</h2>
      <ul>
        <li>
          One-time (prima casa, private seller, non-luxury A/2–A/7):
          <ul>
            <li>Imposta di registro: 2% × cadastral value</li>
            <li>Imposta ipotecaria + catastale: €100 fixed (€50 + €50)</li>
            <li>Notary 1.5% (parameter)</li>
            <li>Real-estate agent 3% + 22% IVA (parameter)</li>
          </ul>
        </li>
        <li>Recurring: TARI flat (annual); IMU exempt (prima casa, non-luxury).</li>
        <li>
          Mutuo deduction: 19% × min(interest paid in year, €4,000) — credit against IRPEF,
          prima casa only.
        </li>
        <li>0.2% bollo on portfolio market value, annually.</li>
        <li>
          Realization (rent-side CGT): 26% on equity ETF gains, 12.5% on Italian/EU
          government bond gains.
        </li>
      </ul>

      <h2 id="policy">Policy simulation (v1.1)</h2>
      <p>
        Several thresholds are inflation-indexed in real life: the NL Box 3 allowance, the
        US standard deduction and SALT cap, the IT mutuo cap, etc. Each of those exposes a
        sibling annual-growth field. At year tick <code>N</code>, the engine evaluates the
        parameter as <code>base × (1 + growth)^(N − 1)</code>, so year 1 always matches the
        base value and growth compounds geometrically afterwards.
      </p>
      <p>
        Set the growth to 0% for "frozen at today's value" (this is what historic IT mutuo
        caps look like). Use 2% to approximate CPI indexation. Negative values let you
        simulate cuts (e.g. SALT cap halving in year 5 — though we only support smooth
        compounding, not step changes; that's a v2 feature).
      </p>
      <p>
        One-time costs (transfer tax, registration tax, NHG/first-time-buyer thresholds,
        cadastral value for closing) aren't escalated since they only fire at <em>t = 0</em>.
      </p>

      <h2>Open assumptions (v1)</h2>
      <ul>
        <li>Dividend withholding tax on equity ETFs ignored.</li>
        <li>NL Box 3: whole portfolio in the "investments" bucket — bond/cash distinction is v2.</li>
        <li>IT: distributions ignored, taxes only at realization.</li>
        <li>Maintenance is a flat % of value — no shock years.</li>
        <li>HOA / TARI / insurance are flat — no inflation modeled.</li>
        <li>NL partnered case uses the same marginal rate for both partners (v1 simplification).</li>
        <li>Italy luxury homes (A/1, A/8, A/9) are excluded — IMU exemption assumed.</li>
        <li>Annual rebalance treated as cost-basis-preserving (a v1 simplification).</li>
      </ul>
    </article>
  );
}
