"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon paths in bundlers like Next.js / Webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DeliveryMapInner({ address, city = "Addis Ababa", status }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Addis Ababa coordinates (Bole / Kazanchis area)
    const restaurantCoords = [9.0084, 38.7885]; // Bole Medhanealem Kitchen
    const customerCoords = [9.0222, 38.7615]; // Customer Delivery Address (Kazanchis/Bole)

    const map = L.map(mapContainerRef.current, {
      center: [9.015, 38.775],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer with mandatory attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marker 1: Addis Eats Kitchen
    const kitchenMarker = L.marker(restaurantCoords, { icon: defaultIcon }).addTo(map);
    kitchenMarker.bindPopup("<b>Addis Eats Kitchen</b><br>Bole Medhanialem, Addis Ababa").openPopup();

    // Marker 2: Customer Destination
    const destMarker = L.marker(customerCoords, { icon: defaultIcon }).addTo(map);
    destMarker.bindPopup(`<b>Delivery Destination</b><br>${address || "Customer Address"}, ${city}`);

    // Draw route line between restaurant and destination
    const route = L.polyline([restaurantCoords, [9.015, 38.772], customerCoords], {
      color: "#b0451e",
      weight: 4,
      dashArray: "6, 8",
    }).addTo(map);

    map.fitBounds(route.getBounds(), { padding: [30, 30] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [address, city]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: "300px", width: "100%" }}
      className="z-0 rounded-2xl shadow-inner overflow-hidden"
      aria-label="Delivery tracking map of Addis Ababa"
    />
  );
}
