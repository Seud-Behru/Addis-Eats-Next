import { ImageResponse } from "next/og";
import { getDish, getDishes } from "@/lib/menu";
import { SITE_NAME, CURRENCY } from "@/lib/site";

// One 1200x630 preview per dish, drawn from the dish record (name, category,
// price, rating). Same ids as the page, so it is generated at build time.
// It does not embed the dish photo: those are third-party hosts, and a slow
// or blocked one would fail the whole build.
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
  const fontSize = name.length > 28 ? 84 : 104; // keep long names on 2 lines

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf7f2",
          color: "#1b3022",
          padding: 72,
          borderLeft: "28px solid #d95c32",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 700 }}>
          <div style={{ display: "flex", color: "#d95c32", letterSpacing: 3 }}>
            {(dish?.category ?? "Menu").toUpperCase()}
          </div>
          <div style={{ display: "flex" }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize, fontWeight: 700, lineHeight: 1.08 }}>{name}</div>
          {dish && (
            <div style={{ display: "flex", marginTop: 28, fontSize: 36, color: "#6d6f6a" }}>
              {`Rated ${dish.rating} / 5  ·  ${dish.reviews}+ reviews`}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              display: "flex",
              background: "#1b3022",
              color: "#faf7f2",
              fontSize: 56,
              fontWeight: 700,
              padding: "14px 40px",
              borderRadius: 999,
            }}
          >
            {dish ? `${dish.price} ${CURRENCY}` : "Order now"}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#6d6f6a" }}>Order on Addis Eats →</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
