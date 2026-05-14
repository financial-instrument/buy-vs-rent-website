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

      <section>
        <h2>The model in one paragraph</h2>
        <p>
          Both households start with the same liquid wealth{" "}
          <strong>W₀ = down payment + buy-side closing costs</strong>. At <em>t = 0</em>{" "}
          the renter invests W₀ into a stock/bond portfolio; the buyer spends it on the
          purchase. Each month, the side with the lower outflow invests the
          differential. Country-specific tax effects (mortgage interest deductions,
          property taxes, wealth taxes) net into the buy-side cash flow once a year so
          they ripple forward through the next year's differential. At the chosen
          horizon we compare end-of-period net worth on both sides.
        </p>
      </section>

      <section>
        <h2>Net worth definitions</h2>
        <p>The two sides use intentionally asymmetric definitions:</p>
        <ul>
          <li>
            <strong>Buy</strong>: <code>(homeValue − loanBalance) + portfolio</code>.
            An accounting view of home equity plus accumulated investments. Sale-side
            transaction costs are configurable (default 0%): set them to ~6–10% to
            see the "if I sold today" liquidation view.
          </li>
          <li>
            <strong>Rent</strong>: <code>portfolio − unrealizedCGT(portfolio)</code>.
            The country-specific capital-gains tax that would be owed on liquidation
            is subtracted (US LTCG ± NIIT, IT 26%/12.5%, NL 0% because Box 3 is paid
            annually).
          </li>
        </ul>
      </section>

      <section>
        <h2>Mortgage math</h2>
        <p>
          Standard annuity amortization: <code>M = L₀ · r / (1 − (1 + r)^−n)</code>{" "}
          with <code>r</code> = monthly rate, <code>n</code> = term in months. Monthly
          split: interest = balance × r; principal = M − interest. Loan balance
          updates each month; the home value follows{" "}
          <code>(1 + appreciation)^(1/12) − 1</code> compounded monthly.
        </p>
      </section>

      <section>
        <h2>Investment portfolio</h2>
        <p>
          Two buckets — equity ETF and government bonds — with a user-controlled
          allocation slider. Monthly returns via{" "}
          <code>(1 + annual)^(1/12) − 1</code>, annual rebalance to the target
          split. Cost basis is tracked per bucket so realization tax is computed
          correctly when the country uses different rates per asset class (Italy)
          or a single LTCG rate (US).
        </p>
      </section>

      <section>
        <h2>Country-specific tax treatment</h2>
        <p>
          The simulator does not branch on country; instead each country implements
          a small set of pure functions: one-time costs, monthly extras, monthly
          property tax, annual buy-side tax effect, portfolio drag, and unrealized
          CGT. Below is what those hooks compute for each jurisdiction.
        </p>

        <h3 id="us">United States</h3>
        <ul>
          <li>Closing costs default 3% of price.</li>
          <li>Property tax = rate × home value (annual, applied monthly).</li>
          <li>PMI = pmiRate × original loan, while LTV &gt; 80%.</li>
          <li>
            <strong>Itemize vs standard each year.</strong> Itemized = deductible
            mortgage interest (interest scaled by{" "}
            <code>min(1, $750k / avgBalance)</code>) + min($10k SALT cap,
            property tax + state-local income tax). State-local income tax is
            approximated as <code>householdIncome × stateLocalIncomeRate</code>
            {" "}— a flat-rate proxy that ignores state-bracket structure. If
            itemized &gt; standard deduction (2025: $15k single / $30k MFJ), we
            apply the federal marginal rate to the excess.
          </li>
          <li>
            Realization tax on rent portfolio: LTCG rate (default 15%) + NIIT
            3.8% if toggled.
          </li>
        </ul>

        <h3 id="nl">Netherlands</h3>
        <ul>
          <li>
            One-time costs: 2% overdrachtsbelasting (transfer tax), or 0% for
            first-time buyers below the threshold (~€525k); ~1.5% notary plus
            advisor; NHG premium of 0.6% of loan when applicable.
          </li>
          <li>
            <strong>Year-1 one-off deduction.</strong> The mortgage-related
            share of the notary + advisor + valuation bundle (default 60%) plus
            the NHG premium in full are deductible from Box 1 income in the
            year of purchase. Refunded at the marginal rate. Only applies to
            HRA-eligible annuity products.
          </li>
          <li>
            Recurring: OZB ~0.1% × WOZ; Eigenwoningforfait at 0.35% of WOZ
            (2.35% above ~€1.31M).
          </li>
          <li>
            <strong>HRA (Hypotheekrenteaftrek):</strong> deductible at the lower
            of marginal rate and the ceiling (≈ 36.97%) — only for annuity
            products. Net annual buy-side tax effect ={" "}
            <code>min(marginal, ceiling) × interestPaid − marginal × EWF</code>.
          </li>
          <li>
            <strong>Box 3:</strong> 2025 transition deemed yield × 36% on
            portfolio above the per-person threshold (~€57k single, doubled if
            partnered). The whole portfolio is treated as the "investments"
            bucket.
          </li>
        </ul>

        <h3 id="it">Italy</h3>
        <ul>
          <li>
            One-time costs (prima casa, private seller, non-luxury A/2–A/7):
            <ul>
              <li>Imposta di registro: 2% × cadastral value</li>
              <li>Imposta ipotecaria + catastale: €100 fixed (€50 + €50)</li>
              <li>Imposta sostitutiva sul mutuo: 0.25% × loan amount</li>
              <li>Notary 1.5% (parameter)</li>
              <li>Real-estate agent 3% + 22% IVA (parameter)</li>
            </ul>
          </li>
          <li>
            Recurring: TARI flat (annual); IMU exempt (prima casa, non-luxury).
          </li>
          <li>
            <strong>Mutuo deduction:</strong> 19% × min(interest paid in year,
            €4,000) — credit against IRPEF, prima casa only.
          </li>
          <li>Bollo: 0.2% on portfolio market value, annually.</li>
          <li>
            Realization tax: 26% on equity ETF gains, 12.5% on Italian/EU
            government bond gains.
          </li>
        </ul>
      </section>

      <section>
        <h2>Policy simulation (inflation indexing)</h2>
        <p>
          Several thresholds are inflation-indexed in real life: the NL Box 3
          allowance, the US standard deduction and SALT cap, the IT mutuo cap,
          and so on. Each exposes a sibling annual-growth field. At year tick{" "}
          <code>N</code>, the engine evaluates the parameter as{" "}
          <code>base × (1 + growth)^(N − 1)</code>, so year 1 always matches the
          base value and growth compounds geometrically afterwards.
        </p>
        <p>
          Set the growth to 0% for "frozen at today's value" (this is what
          historic IT mutuo caps look like). Use 2% to approximate CPI
          indexation. Negative values let you simulate cuts. We only support
          smooth compounding, not step changes.
        </p>
        <p>
          One-time costs (transfer tax, registration tax, NHG and first-time-buyer
          thresholds, cadastral value for closing) are not escalated since they
          only fire at <em>t = 0</em>.
        </p>
      </section>

      <section>
        <h2>Open assumptions</h2>
        <ul>
          <li>Dividend withholding tax on equity ETFs ignored.</li>
          <li>
            NL Box 3: whole portfolio in the "investments" bucket — bond/cash
            distinction is not modelled.
          </li>
          <li>IT: distributions ignored, taxes only at realization.</li>
          <li>Maintenance is a flat % of value — no shock years.</li>
          <li>HOA / TARI / insurance are flat — no inflation modelled.</li>
          <li>
            NL partnered case uses the same marginal rate for both partners
            (simplification).
          </li>
          <li>
            Italy luxury homes (A/1, A/8, A/9) are excluded — IMU exemption
            assumed.
          </li>
          <li>
            Annual rebalance treated as cost-basis-preserving (a simplification —
            in practice rebalancing crystallises gains).
          </li>
        </ul>
      </section>
    </article>
  );
}
