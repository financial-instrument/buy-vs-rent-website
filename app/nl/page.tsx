import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Rent vs Buy in the Netherlands",
  description:
    "Should you rent or buy in the Netherlands? Models HRA, EWF, Box 3 wealth tax, NHG, and transfer tax.",
};

export default function NLPage() {
  return (
    <Suspense fallback={<div className="p-12 text-sm text-muted-foreground">Loading…</div>}>
      <Calculator country="nl" currency="EUR" />
    </Suspense>
  );
}
