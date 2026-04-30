import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Rent vs Buy in the United States",
  description:
    "Should you rent or buy in the US? Side-by-side after-tax comparison with MID, SALT cap, PMI, and LTCG.",
};

export default function USPage() {
  return (
    <Suspense fallback={<div className="p-12 text-sm text-muted-foreground">Loading…</div>}>
      <Calculator country="us" currency="USD" />
    </Suspense>
  );
}
