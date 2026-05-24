import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rent vs Buy Calculator: US, Netherlands, Italy";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ fontSize: 108, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>
          Rent vs Buy
        </div>
        <div
          style={{
            fontSize: 36,
            marginTop: 32,
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Honest after-tax comparison for the US, Netherlands, and Italy
        </div>
        <div style={{ display: "flex", fontSize: 96, marginTop: 56, gap: 32 }}>
          <span>🇺🇸</span>
          <span>🇳🇱</span>
          <span>🇮🇹</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
