import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// Site-wide social preview (used by every route without its own image).
// Drawn with JSX -> PNG at build time; no remote fetches, so it never fails
// on a slow network. Colors are the app's own tokens (forest / cream / terracotta).
export const alt = "Addis Eats — Ethiopian food delivered across Addis Ababa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1b3022",
          color: "#faf7f2",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, color: "#d95c32", fontWeight: 700 }}>
          KITCHEN TO TABLE · ADDIS ABABA
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 24, color: "rgba(250,247,242,0.8)" }}>
            Delicious meals, delivered across Addis.
          </div>
        </div>
        <div style={{ display: "flex", height: 12, width: 220, background: "#d95c32", borderRadius: 6 }} />
      </div>
    ),
    { ...size }
  );
}
