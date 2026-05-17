import { itDefaults, nlDefaults, usDefaults } from "@/lib/calc";
import type { Country, CountryInputs, ITInputs, NLInputs, USInputs } from "@/lib/calc/core/types";
import { itSchema } from "@/lib/schema/it";
import { nlSchema } from "@/lib/schema/nl";
import { usSchema } from "@/lib/schema/us";
import { SHORT_KEYS } from "./encode";

const BOOL_FIELDS = new Set([
  "niit",
  "partnered",
  "firstTimeBuyer",
  "nhg",
  "interestOnly",
]);
const STRING_FIELDS = new Set(["filing", "country", "box3Mode"]);
const INT_FIELDS = new Set(["termYears", "horizonYears", "nhgRateReductionBps"]);

function parseValue(field: string, raw: string): unknown {
  if (BOOL_FIELDS.has(field)) return raw === "1" || raw === "true";
  if (STRING_FIELDS.has(field)) return raw;
  const n = Number(raw);
  if (Number.isNaN(n)) return undefined;
  return INT_FIELDS.has(field) ? Math.round(n) : n;
}

export function decode(country: Country, search: URLSearchParams): CountryInputs {
  const defaults =
    country === "us" ? usDefaults() : country === "nl" ? nlDefaults() : itDefaults();
  const draft: Record<string, unknown> = { ...defaults };

  for (const [field, short] of SHORT_KEYS.COMMON_KEYS) {
    const v = search.get(short);
    if (v !== null) draft[field as string] = parseValue(field as string, v);
  }
  if (country === "us") {
    for (const [field, short] of SHORT_KEYS.US_KEYS) {
      const v = search.get(short);
      if (v !== null) draft[field as string] = parseValue(field as string, v);
    }
    return usSchema.parse(draft) as USInputs;
  }
  if (country === "nl") {
    for (const [field, short] of SHORT_KEYS.NL_KEYS) {
      const v = search.get(short);
      if (v !== null) draft[field as string] = parseValue(field as string, v);
    }
    return nlSchema.parse(draft) as NLInputs;
  }
  for (const [field, short] of SHORT_KEYS.IT_KEYS) {
    const v = search.get(short);
    if (v !== null) draft[field as string] = parseValue(field as string, v);
  }
  return itSchema.parse(draft) as ITInputs;
}
