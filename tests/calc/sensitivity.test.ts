import { describe, expect, it } from "vitest";
import { runSensitivity } from "@/lib/calc/sensitivity";
import { runSimulation, usDefaults } from "@/lib/calc";

describe("sensitivity grid", () => {
  it("returns a square grid centred on the base inputs", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const expectedLen = Math.round(0.02 / 0.005) * 2 + 1; // ±2% in 0.5% steps → 9
    expect(grid.rowValues).toHaveLength(expectedLen);
    expect(grid.colValues).toHaveLength(expectedLen);
    expect(grid.deltas).toHaveLength(expectedLen);
    grid.deltas.forEach((row) => expect(row).toHaveLength(expectedLen));
  });

  it("centre cell matches a direct runSimulation on the base inputs", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.rowValues.length - 1) / 2;
    const direct = runSimulation(base).delta;
    expect(grid.deltas[mid][mid]).toBeCloseTo(direct, 1);
  });

  it("higher appreciation favours buying (delta increases along the appreciation axis)", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.rowValues.length - 1) / 2;
    // For a fixed mortgage rate, delta should be monotone non-decreasing in appreciation.
    const row = grid.deltas[mid];
    for (let i = 1; i < row.length; i++) {
      expect(row[i]).toBeGreaterThan(row[i - 1]);
    }
  });

  it("higher mortgage rate hurts buying (delta decreases along the rate axis)", () => {
    const base = usDefaults();
    const grid = runSensitivity(base);
    const mid = (grid.colValues.length - 1) / 2;
    const col = grid.deltas.map((row) => row[mid]);
    for (let i = 1; i < col.length; i++) {
      expect(col[i]).toBeLessThan(col[i - 1]);
    }
  });

  it("custom axes: horizon × equity return", () => {
    const base = usDefaults();
    const grid = runSensitivity(base, {
      rowAxis: "horizonYears",
      colAxis: "equityReturnPct",
    });
    expect(grid.rowAxis).toBe("horizonYears");
    expect(grid.colAxis).toBe("equityReturnPct");
    expect(grid.rowValues.length).toBeGreaterThan(1);
    expect(grid.colValues.length).toBeGreaterThan(1);
    // Higher equity return → renter portfolio compounds harder → buy delta goes DOWN.
    const midRow = Math.floor(grid.rowValues.length / 2);
    const row = grid.deltas[midRow];
    expect(row[row.length - 1]).toBeLessThan(row[0]);
  });
});
