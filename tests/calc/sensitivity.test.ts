import { describe, expect, it } from "vitest";
import { runSensitivity } from "@/lib/calc/sensitivity";
import { runSimulation, usDefaults } from "@/lib/calc";

describe("sensitivity grid", () => {
  it("returns a square grid centred on the base inputs", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const expectedLen = Math.round(0.02 / 0.005) * 2 + 1; // ±2% in 0.5% steps → 9
    expect(grid.rates).toHaveLength(expectedLen);
    expect(grid.appreciations).toHaveLength(expectedLen);
    expect(grid.deltas).toHaveLength(expectedLen);
    grid.deltas.forEach((row) => expect(row).toHaveLength(expectedLen));
  });

  it("centre cell matches a direct runSimulation on the base inputs", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.rates.length - 1) / 2;
    const direct = runSimulation(base).delta;
    expect(grid.deltas[mid][mid]).toBeCloseTo(direct, 1);
  });

  it("higher appreciation favours buying (delta increases along the appreciation axis)", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.rates.length - 1) / 2;
    // For a fixed mortgage rate, delta should be monotone non-decreasing in appreciation.
    const row = grid.deltas[mid];
    for (let i = 1; i < row.length; i++) {
      expect(row[i]).toBeGreaterThan(row[i - 1]);
    }
  });

  it("higher mortgage rate hurts buying (delta decreases along the rate axis)", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.appreciations.length - 1) / 2;
    const col = grid.deltas.map((row) => row[mid]);
    for (let i = 1; i < col.length; i++) {
      expect(col[i]).toBeLessThan(col[i - 1]);
    }
  });
});
