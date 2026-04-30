import { simulate } from "./core/simulate";
import type { CountryInputs, SimulationResult } from "./core/types";
import { itRules } from "./it/rules";
import { nlRules } from "./nl/rules";
import { usRules } from "./us/rules";

export function runSimulation(input: CountryInputs): SimulationResult {
  switch (input.country) {
    case "us":
      return simulate(input, usRules);
    case "nl":
      return simulate(input, nlRules);
    case "it":
      return simulate(input, itRules);
  }
}

export { usRules } from "./us/rules";
export { nlRules } from "./nl/rules";
export { itRules } from "./it/rules";
export { usDefaults } from "./us/defaults";
export { nlDefaults } from "./nl/defaults";
export { itDefaults } from "./it/defaults";
export type * from "./core/types";
