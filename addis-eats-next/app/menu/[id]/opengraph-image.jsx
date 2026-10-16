import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";
import { getDish, getDishes } from "@/lib/menu";
import { SITE_NAME, CURRENCY } from "@/lib/site";

// Generate 1200x630 OpenGraph preview per dish embedding the ACTUAL dish photography
// along with real-time dish metadata, price in ETB, and Addis Eats brand tokens.
export const alt = "Dish preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getDishes().map((d) => ({ id: d.id }));
}

export default async function Image({ params }) {
  const { id } = await params;
  const dish = getDish(id);

  const name = dish?.name ?? SITE_NAME;
  const fontSize = name.length > 25 ? 46 : name.length > 18 ? 54 : 64;

  // Load the actual dish photo from the filesystem at build/render time
  let imageBase64 = null;
  if (dish?.image) {
    try {
      const cleanPath = dish.image.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      if (fs.existsSync(fullPath)) {
        const fileBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        imageBase64 = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    } catch {
      // In case of read issue, graceful fallback without image
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#142419",
        }}
      >
        {/* Left Information Card */}
        <div
          style={{
            width: "56%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "50px 48px",
            backgroundColor: "#1b3022",
            borderRight: "4px solid #b0451e",
          }}
        >
          {/* Header pill & brand */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  background: "#b0451e",
                  color: "#ffffff",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 2,
                }}
              >
                {(dish?.category ?? "MENU").toUpperCase()}
              </div>
              {dish?.badge && (
                <div style={{ display: "flex", color: "#f08a63", fontSize: 16, fontWeight: 600, marginLeft: 12 }}>
                  {`• ${dish.badge}`}
                </div>
              )}
            </div>
            <div style={{ display: "flex", color: "#faf7f2", fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>
              {SITE_NAME}
            </div>
          </div>

          {/* Title & Description */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
              }}
            >
              {name}
            </div>
            <div
              style={{
                display: "flex",
                color: "#e8e2d8",
                fontSize: 20,
                lineHeight: 1.4,
                marginTop: 14,
                maxHeight: 80,
                overflow: "hidden",
              }}
            >
              {dish?.description}
            </div>
            {dish && (
              <div style={{ display: "flex", color: "#f08a63", fontSize: 20, fontWeight: 700, marginTop: 14 }}>
                {`Rated ${dish.rating} / 5  ·  ${dish.reviews}+ reviews`}
              </div>
            )}
          </div>

          {/* Bottom Price & CTA */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div
              style={{
                display: "flex",
                background: "#b0451e",
                color: "#ffffff",
                fontSize: 34,
                fontWeight: 800,
                padding: "10px 28px",
                borderRadius: 999,
              }}
            >
              {dish ? `${dish.price} ${CURRENCY}` : "Order Now"}
            </div>
            <div style={{ display: "flex", color: "#f0ebe3", fontSize: 18, fontWeight: 600 }}>
              Addis Ababa Delivery →
            </div>
          </div>
        </div>

        {/* Right Photo: The ACTUAL dish photo */}
        <div
          style={{
            width: "44%",
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#142419",
          }}
        >
          {imageBase64 ? (
            <img
              src={imageBase64}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#a9a294",
                fontSize: 24,
              }}
            >
              {name}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
