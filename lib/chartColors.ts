// Single source of truth for the buy/rent series colors. Defined as CSS vars
// in app/globals.css (--buy = #10b981 emerald, --rent = #3b82f6 blue) so the
// charts and the input-group tints are guaranteed to match and theme together.
// Recharts passes these straight through to SVG stroke/fill, where the var
// resolves normally.
export const BUY_COLOR = "hsl(var(--buy))";
export const RENT_COLOR = "hsl(var(--rent))";
