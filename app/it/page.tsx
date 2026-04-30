import { Suspense } from "react";
import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Rent vs Buy in Italy",
  description:
    "Should you rent or buy in Italy? Prima-casa registration tax, mutuo deduction, bollo, and equity-vs-bond CGT.",
};

export default function ITPage() {
  return (
    <Suspense fallback={<div className="p-12 text-sm text-muted-foreground">Loading…</div>}>
      <Calculator country="it" currency="EUR" />
    </Suspense>
  );
}
