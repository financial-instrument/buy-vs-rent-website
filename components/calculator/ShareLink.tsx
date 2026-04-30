"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import type { CountryInputs } from "@/lib/calc/core/types";
import { encode } from "@/lib/url/encode";

export function ShareLink({ inputs }: { inputs: CountryInputs }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const qs = encode(inputs);
    const url = `${window.location.origin}${window.location.pathname}?${qs}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.history.replaceState(null, "", `?${qs}`);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onCopy} data-testid="share-link">
      <Link2 className="mr-2 h-4 w-4" />
      {copied ? "Copied!" : "Copy shareable link"}
    </Button>
  );
}
