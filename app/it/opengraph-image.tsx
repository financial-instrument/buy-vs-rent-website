import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Rent vs Buy in Italy";

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
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #16a34a 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ fontSize: 220, lineHeight: 1 }}>🇮🇹</div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            marginTop: 24,
            letterSpacing: -2,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          Rent vs Buy: Italy
        </div>
        <div
          style={{
            fontSize: 30,
            marginTop: 24,
            opacity: 0.9,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.3,
          }}
        >
          Prima casa, mutuo, bollo, and the 26%/12.5% CGT split, all modelled
        </div>
      </div>
    ),
    { ...size },
  );
}
