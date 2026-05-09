# Rent vs Buy Calculator

An honest after-tax rent-vs-buy calculator for the **United States**, **Netherlands**, and **Italy**.

## Live site

- Landing: <https://rentingbuycalc.com>
- 🇺🇸 US: <https://rentingbuycalc.com/us>
- 🇳🇱 Netherlands: <https://rentingbuycalc.com/nl>
- 🇮🇹 Italy: <https://rentingbuycalc.com/it>
- Methodology: <https://rentingbuycalc.com/methodology>
- About: <https://rentingbuycalc.com/about>

## What it does

Both households start with the same liquid wealth — down payment plus buy-side closing costs. The buyer spends it on the house; the renter invests it. Each month, the lower-outflow side invests the difference, and country-specific tax effects (HRA, MID, mutuo credit, EWF, Box 3, bollo, LTCG/NIIT) are netted in once a year. The result is a year-by-year net-worth curve for both sides.

Inputs are encoded in the URL — copy the share link from any country page to send a complete scenario.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind · shadcn/ui · Recharts · Vitest · Playwright. Pure-TypeScript engine in `lib/calc/` is Worker-portable for a future Monte Carlo phase.

## Local development

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck   # tsc --noEmit
npm test            # Vitest
npm run build       # Production build (all routes static)
npm run e2e         # Playwright
```

## License

Educational tool. Not financial advice.
