# Rent vs Buy Calculator — Spec (v1)

## Context

A public web app that compares the financial outcome of renting vs buying a home over a user-chosen horizon, in three tax regimes: **US**, **Netherlands**, **Italy**. The calculator is honest about opportunity cost (the renter invests the down payment + closing costs + any monthly cash-flow differential) and country-specific taxation (mortgage interest deduction, transfer/registration tax, wealth tax, capital-gains tax, etc.), so that "buy is better" or "rent is better" reflects real after-tax outcomes, not naive equity-vs-rent math.

The site is a long-tail SEO play monetized via Google AdSense. It must be statically generated, fast, and shareable via URL state.

---

## Scope

### v1

- 3 country pages: US, NL, IT (resident only — no expat regimes)
- Deterministic year-by-year net-worth curves for both scenarios. Sensitivity grid (rate × appreciation × horizon) is in scope but deferred to a later phase.
- Single fixed-rate mortgage product per country (annuity / standard amortization). Term and horizon are both user inputs (term ≥ horizon)
- Symmetric scenarios: both households start with the same liquid wealth `W₀ = down payment + buy-side closing costs`. Renter invests `W₀` at t=0. Each month, whichever side has the lower outflow invests the differential — the comparison is fully symmetric
- Equity/bond split with user-controlled allocation, rebalanced annually. Equity vehicle = diversified stock ETF; bond vehicle = government bonds (matters for IT realization tax)
- **Net worth** definition:
  - Buy: `(V_t − L_t) + P_t^buy` — accounting value of home equity, **no** sale-side transaction costs or home CGT subtracted. UI must surface the caveat: "if you sold today, ~6–10% in agent/notary/transfer costs would come off."
  - Rent: `P_t^rent − unrealizedCGT(P_t^rent)` — portfolio market value minus the country-specific capital-gains tax that would be owed on liquidation. Asymmetric vs Buy by design (liquid vs illiquid framing).
- Nominal currency only (no real / CPI-adjusted view in v1, but inflation inputs flow through to rent escalation and home appreciation)
- Italy: hard-default **prima casa, purchase from private seller**. No `seconda casa` toggle in v1
- US: filing status (single vs MFJ), itemize-vs-standard auto-decided each year using only mortgage interest + (capped) SALT — no other itemizable inputs
- NL: partner toggle (doubles Box 3 threshold, drives HRA tax-rate ceiling per partner). NHG toggle
- English only
- URL-encoded inputs ("share my scenario" via copy-link); no save/login

### Out of scope for v1 (architect for later)

- Sensitivity grids over (rate × appreciation × horizon) — slot in after v1 ships
- Monte Carlo over investment returns + appreciation
- Early sale, refinancing, extra principal payments
- Localization (Dutch, Italian)
- Scenario save / accounts / backend

---

## Tech Stack

**Next.js 15 (App Router) + TypeScript (strict) + Tailwind + shadcn/ui + Recharts + React Hook Form + Zod + Zustand + next-intl (configured but English-only) + Vitest + Playwright. Deployed on Vercel.** AdSense placed in the page layout outside the calculator card. Plausible + GA4 for analytics.

The calculator engine is pure TypeScript with no React deps (`/lib/calc/{core,us,nl,it}/`) — unit-testable and Worker-portable for v2 Monte Carlo. URL query params are the source of truth for state; Zustand is a thin in-memory mirror.

URL structure:
- `/` — landing page, country picker, SEO content
- `/us`, `/nl`, `/it` — country calculator pages, statically generated
- `/methodology` — the math, transparently (also great for SEO)
- `/about`

---

## Inputs

### Universal (shown on every country page)

| Input | Default | Notes |
|---|---|---|
| Home price | — | currency follows country |
| Down payment % | 20% (US), 10% (NL), 20% (IT) | derives loan principal |
| Mortgage rate (annual nominal) | — | fixed product |
| Mortgage term (yrs) | 30 (US/NL), 25 (IT) | user input |
| Time horizon (yrs) | 10 | ≤ term |
| Buy-side closing costs % of price | country defaults below | user-overridable |
| Annual home appreciation % | 3% | nominal |
| Annual maintenance % of value | 1% | flat |
| Annual home insurance | country default | currency |
| HOA / VvE / condo monthly fee | 0 | |
| Monthly rent | — | **all-inclusive single number** (renter's insurance, HOA-equivalents, utilities-as-wash baseline) |
| Annual rent inflation % | 3% | |
| CPI (display only in v1) | 2% | |
| Equity expected return (annual nominal) | 7% | |
| Bond expected return (annual nominal) | 4% | |
| Equity / bond split | 70/30 slider | annual rebalance |
| Filing/household status | single | semantics differ per country |

### US-specific
- State + local income tax rate (drives SALT)
- Federal marginal income tax rate (drives MID benefit; we don't recompute brackets)
- Property tax rate % of value
- PMI rate % of loan (applied while LTV > 80%)
- Filing: single vs MFJ → standard deduction $15,000 / $30,000 (2025; parameter)
- LTCG rate (default 15%) + NIIT toggle (3.8%, default off)

### NL-specific
- WOZ value (defaults to home price)
- Partnered? (single vs fiscal partner → doubles Box 3 threshold)
- Marginal income tax rate (per partner if partnered)
- NHG toggle (eligibility check vs threshold parameter; reduces rate by user-input bps)
- Mortgage product: annuity (default, HRA-eligible) — interest-only is a v1 toggle that switches HRA off

### IT-specific
- Cadastral value (rendita catastale × coefficient) — user enters directly
- Notary fees % (default 1.5%)
- Real estate agent fees % + IVA (default 3% + 22% IVA)
- TARI (annual flat, default €300)
- Hard-coded: prima casa, private seller, non-luxury (A/2–A/7) — show a note that A/1/A/8/A/9 are out of scope

---

## Core Financial Model

Time grid: monthly. Year-end tick applies annual taxes/deductions. State at month `t`:
- `L_t` loan balance, `V_t` home value (geometric monthly appreciation)
- `R_t` monthly rent (steps annually)
- `P_t^buy`, `P_t^rent` portfolio values per scenario
- Cost basis tracked per portfolio for realization-tax computation

### Mortgage (annuity, fixed)
`M = L₀ · r / (1 − (1+r)^−n)` where `r` = monthly rate, `n` = term in months. Monthly split: `I_t = L_{t−1} · r`, principal = `M − I_t`.

### Buy-scenario monthly outflow
`Buy_t = M + propertyTax_t/12 + insurance/12 + HOA + maintenance(V_t)/12 + PMI_t/12 + countryAdj_t`

`PMI_t > 0` only while `L_t / V_t > 0.8` (US only).

### Rent-scenario monthly outflow
`Rent_t` — single all-inclusive number, escalated annually by rent inflation.

### Symmetric differential rule
- t=0: buyer spends `W₀` on purchase. Renter invests `W₀` into portfolio.
- Each month, `Δ_t = Buy_t − Rent_t`.
  - If `Δ_t > 0` → renter invests `Δ_t`; buyer invests 0.
  - If `Δ_t < 0` → buyer invests `−Δ_t`; renter invests 0.
- Annual tax effects (HRA refund, MID benefit, mutuo deduction, EWF add-back, Box 3 drag, IT bollo, US PMI dropout) are netted into the buy-side cash flow once per year (Dec tick) so they ripple through the differential.

### Portfolio dynamics
Allocation `s` equity / `1−s` bonds. Monthly returns from annual via `(1+r)^(1/12)−1`. Annual rebalance to target if user opts in (default on). Cost basis updated on each contribution.

### Per-country annual portfolio drag
- **US**: no annual drag (deferral). Dividend WHT ignored in v1; documented.
- **NL**: Box 3 fictitious-yield wealth tax — apply 2025 transition-regime deemed yield × 36% on portfolio above (per-person, doubled if partnered) tax-free threshold. v1 treats the whole portfolio as the "investments" bucket.
- **IT**: 0.2% bollo on portfolio market value, annually.

### Realization at horizon end (rent-side CGT subtracted from net worth at every tick)
- **US**: LTCG rate × (P_T − basis) + NIIT 3.8% if toggle on.
- **NL**: already taxed annually via Box 3; realization tax = 0.
- **IT**: 26% on equity-ETF gains, 12.5% on gov-bond gains. Track basis per bucket.

### Edge cases
- LTV > 100% (negative equity) — display, don't error
- Loan paid off before horizon (term < horizon shouldn't happen given our constraint, but handle gracefully)
- Partner threshold doubling NL — only applies when `partnered = true`
- Italy luxury-class home — out of scope, methodology note

---

## Country Modules

### `/lib/calc/us/`

**One-time:** closing costs default 3% of price.

**Recurring annual:**
- Property tax = `propertyTaxRate × V_t`
- PMI = `pmiRate × L₀` while LTV > 80%, else 0
- **Itemize vs standard each year**: candidate itemized = (deductible mortgage interest, capped at interest on min(`L_avg`, $750k acquisition debt limit)) + min($10k SALT cap, propertyTax + stateIncomeTax). If candidate > standard deduction → itemize. MID benefit = `marginalRate × (candidateItemized − standardDeduction)` floored at 0.
- Standard deduction 2025: $15,000 single / $30,000 MFJ (parameter).
- Home CGT exclusion: informational only (we don't realize home in v1).

### `/lib/calc/nl/`

**One-time:**
- Transfer tax (overdrachtsbelasting): 2% standard; 0% for first-time-buyer toggle if home < threshold (param ~€525k, expose for adjustment)
- Notary + valuation + advisor: combined ~1.5% default
- NHG one-off: 0.6% of loan if NHG toggle on AND home < NHG threshold (~€435k, parameter)

**Recurring annual:**
- OZB property tax: ~0.1% × WOZ (parameter)
- Eigenwoningforfait: 0.35% × WOZ (≤ €1.31M; 2.35% on excess above) ADDED to taxable income → drag = `marginalRate × EWF`
- Hypotheekrenteaftrek: deduct mortgage interest from taxable income, **capped at HRA ceiling rate** (~36.97% for 2025; parameter). Net annual buy-side tax effect = `min(marginalRate, HRA_ceilingRate) × interestPaidYr − marginalRate × EWF`. Only applies for annuity/linear products.
- 30-year HRA cap: not a v1 issue since horizon ≤ term ≤ 30, but enforce in code.

**Investment-side:**
- Box 3: tax-free threshold ~€57,000 single / ~€114,000 partnered (2025 params). Above threshold, deemed yield × 36% applied annually. v1 uses single deemed-yield value for whole portfolio.

### `/lib/calc/it/`

**One-time (prima casa, private seller):**
- Imposta di registro: 2% × cadastral value
- Imposta ipotecaria + catastale: €100 fixed (€50 + €50)
- Notary: 1.5% of price (parameter)
- Real estate agent: 3% + 22% IVA (parameter, both adjustable)

**Recurring annual:**
- IMU: prima casa exempt (assume non-luxury — A/2–A/7)
- TARI: user input flat
- Mortgage interest deduction: 19% × min(interestPaidYr, €4,000) credit against IRPEF, prima casa only

**Investment-side:**
- 0.2% bollo on portfolio value, annually
- Realization (rent-side CGT): 26% on equity ETF gains; 12.5% on Italian/EU gov bond gains. Track separately per bucket.

---

## UI

Single-page calculator per country. Mobile-first.

- Hero strip: country flag + "Rent vs Buy in {Country}"
- **Inputs accordion** grouped: Home, Mortgage, Recurring costs, Rent, Investments, Tax/household
- **Sticky summary card**: horizon net worth Buy vs Rent, winner badge, delta
- **Net worth over time** (Recharts line chart, Buy + Rent series, year ticks)
- **Monthly cost composition** (Recharts stacked bar at horizon midpoint: P&I, taxes, maintenance, insurance, HOA — buy side; rent — rent side)
- **Methodology link** with anchor to that country's section
- **Copy shareable link** button
- AdSense slot below the chart, never inside the form

shadcn/ui primitives: Slider, Input, Tabs, Accordion, Card, Tooltip, Switch.

---

## File Layout

```
/app
  /(marketing)/page.tsx            # landing
  /us/page.tsx /nl/page.tsx /it/page.tsx
  /methodology/page.tsx /about/page.tsx
  /layout.tsx                      # AdSense + analytics
/components
  /calculator/Inputs.tsx Summary.tsx NetWorthChart.tsx MonthlyCostChart.tsx ShareLink.tsx
  /ads/AdSense.tsx
/lib
  /calc/core/{types.ts, amortization.ts, portfolio.ts, simulate.ts}
  /calc/us/{rules.ts, taxes.ts, costs.ts, defaults.ts}
  /calc/nl/{rules.ts, taxes.ts, costs.ts, defaults.ts}
  /calc/it/{rules.ts, taxes.ts, costs.ts, defaults.ts}
  /url/{encode.ts, decode.ts}
  /schema/{us.ts, nl.ts, it.ts}    # Zod, mirrors form types
/tests/calc/*.test.ts              # Vitest golden-number tests per country
/e2e/*.spec.ts                     # Playwright smoke
```

---

## Implementation Phases

1. **Scaffold** — Next 15 app, Tailwind, shadcn, Recharts, Vitest, Playwright, Vercel project. AdSense + analytics stubs.
2. **Core engine** — `core/amortization`, `core/portfolio`, `core/simulate` with the symmetric differential rule and per-country hook points. Vitest goldens.
3. **US module + first end-to-end page** — itemize/SALT/MID/PMI logic; full input form; charts and summary card; URL encode/decode.
4. **NL module** — EWF + HRA + Box 3 + NHG + transfer tax. Most complex; budget extra time.
5. **IT module** — registration tax on cadastral value, mutuo deduction, bollo, equity-vs-gov-bond realization.
6. **Methodology page** — write the math and per-country rules transparently. Cite tax-year params.
7. **SEO** — metadata, sitemap, OG images, internal links between country pages and methodology.
8. **Sensitivity grid** — deferred until after the three country pages ship; add a `<SensitivityTable>` component reusing the engine.
9. **Polish + Lighthouse pass + AdSense activation + deploy**.

---

## Verification

- **Unit (Vitest, golden numbers):**
  - US 30-yr fixed payment vs published amortization output for several principals/rates
  - US itemize-vs-standard switching at the boundary (mortgage interest + SALT just above/below standard deduction)
  - NL HRA refund for a worked example with known marginal rate and HRA ceiling
  - NL Box 3 with and without partner doubling, above and below threshold
  - IT registration tax = 2% × cadastral value; mutuo deduction caps at €4,000 × 19%
  - IT realization tax: 26% equity vs 12.5% gov-bond on same nominal gain
  - Symmetric differential rule: when Buy = Rent each month, both portfolios end equal modulo W₀ on the rent side and equity build-up on the buy side
- **Cross-check:** load a published NYT-style example (US) and confirm direction (rent better / buy better) matches at common parameter sets.
- **Lighthouse:** ≥95 performance, 100 SEO on country pages.
- **Playwright smoke:** load `/us`, mutate down-payment slider, assert net-worth chart re-renders and the share-link round-trips state.

---

## Open assumptions (document on `/methodology`)

- Dividend WHT on equity ETFs ignored in v1 (small drag, country-dependent)
- NL Box 3: whole portfolio treated as "investments" bucket — bond/cash distinction is a v2 refinement
- IT: ignore distributions; tax only at realization
- Maintenance is a flat % of value, no shocks
- HOA / TARI / insurance flat (no inflation in v1)
- Both filers/partners use the same marginal rate when partnered in NL (v1 simplification; expose per-partner in v2)
- Italy luxury homes (A/1, A/8, A/9) excluded — show a note rather than model IMU + reduced benefits
