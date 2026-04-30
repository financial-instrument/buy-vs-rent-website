// escalate(base, growth, yearIndex) → base × (1 + growth)^yearIndex
// yearIndex is 0-based (year 1 of the simulation = index 0).
//
// Used by country rules to advance inflation-indexed thresholds (Box 3 allowance,
// SALT cap, mutuo cap, ...) over the simulation horizon. growth = 0 → no change.

export function escalate(base: number, growth: number, yearIndex: number): number {
  if (growth === 0 || yearIndex <= 0) return base;
  return base * Math.pow(1 + growth, yearIndex);
}
