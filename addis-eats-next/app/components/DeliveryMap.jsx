"use client";

import dynamic from "next/dynamic";
import { MapPin, Navigation, Clock } from "lucide-react";

// Loaded dynamically with ssr: false as required
const DeliveryMapInner = dynamic(() => import("./DeliveryMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: "300px" }}
      className="flex w-full animate-pulse items-center justify-center rounded-2xl bg-surface text-sm text-muted"
      aria-busy="true"
    >
      Loading delivery map of Addis Ababa...
    </div>
  ),
});

export default function DeliveryMap({ address, city = "Addis Ababa", status = "Preparing" }) {
  return (
    <section aria-labelledby="delivery-map-heading" className="mt-8 rounded-2xl bg-card p-6 shadow-sm">
      <h2 id="delivery-map-heading" className="font-display text-xl font-semibold text-heading">
        Live Delivery Route
      </h2>
      <p className="mt-1 text-xs text-muted">
        Tracking delivery from our central kitchen in Bole to your location.
      </p>

      {/* Map with explicit height */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <DeliveryMapInner address={address} city={city} status={status} />
      </div>

      {/* Plain text repetition of delivery information nearby */}
      <div className="mt-5 grid gap-4 rounded-xl bg-surface p-4 text-xs sm:grid-cols-3">
        <div className="flex items-start gap-2.5">
          <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
          <div>
            <p className="font-bold text-heading">Kitchen Origin</p>
            <p className="text-muted">Bole Medhanialem, Bole, Addis Ababa</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
          <div>
            <p className="font-bold text-heading">Destination Address</p>
            <p className="text-muted">{address ? `${address}, ${city}` : city}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-cta" aria-hidden="true" />
          <div>
            <p className="font-bold text-heading">Estimated Delivery</p>
            <p className="text-muted">~25 - 35 minutes · Status: {status}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
