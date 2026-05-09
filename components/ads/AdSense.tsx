"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseProps {
  slot?: string;
  className?: string;
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSense({ slot, className }: AdSenseProps) {
  useEffect(() => {
    if (!CLIENT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* noop */
    }
  }, []);

  if (!CLIENT) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        className={`rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground ${className ?? ""}`}
      >
        Ad slot (configure NEXT_PUBLIC_ADSENSE_CLIENT to activate)
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
