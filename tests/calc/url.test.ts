import { describe, expect, it } from "vitest";
import { itDefaults, nlDefaults, usDefaults } from "@/lib/calc";
import { decode } from "@/lib/url/decode";
import { encode } from "@/lib/url/encode";

describe("URL round-trip", () => {
  it("US defaults round-trip", () => {
    const orig = usDefaults();
    const params = new URLSearchParams(encode(orig));
    const back = decode("us", params);
    expect(back).toEqual(orig);
  });

  it("NL defaults round-trip", () => {
    const orig = nlDefaults();
    const params = new URLSearchParams(encode(orig));
    const back = decode("nl", params);
    expect(back).toEqual(orig);
  });

  it("IT defaults round-trip", () => {
    const orig = itDefaults();
    const params = new URLSearchParams(encode(orig));
    const back = decode("it", params);
    expect(back).toEqual(orig);
  });

  it("partial query string falls back to defaults", () => {
    const params = new URLSearchParams("hp=500000");
    const back = decode("us", params);
    expect(back.homePrice).toBe(500_000);
    expect(back.downPaymentPct).toBe(usDefaults().downPaymentPct);
  });
});
