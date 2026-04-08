import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { getHostApproximateCoordinates, getNightlyRate } from "../utils/hostUtils";
import "leaflet/dist/leaflet.css";
import "./SearchResultsMap.css";

/* Fix Leaflet default icon path issue with webpack/CRA */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Auto-fit map bounds whenever the host list changes
const FitBounds = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || coords.length === 0) return;

    if (coords.length === 1) {
      map.setView(coords[0], 14);
      return;
    }

    try {
      const bounds = L.latLngBounds(coords.map((c) => L.latLng(c[0], c[1])));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(coords)]);   // re-run whenever the coord list changes

  return null;
};

const createPriceIcon = (price, active = false) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div class="price-marker${active ? " price-marker--active" : ""}">$${price}</div>`,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
    popupAnchor: [0, -18],
  });

const SearchResultsMap = ({ hosts }) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);

  // Use approximate coordinates (real lat/lng first, then city lookup)
  const validHosts = (hosts || [])
    .map((host) => {
      const coords = getHostApproximateCoordinates(host);
      return coords ? { ...host, _coords: coords } : null;
    })
    .filter(Boolean);

  if (validHosts.length === 0) {
    return (
      <div className="map-empty">
        <div className="map-empty__icon">🗺️</div>
        <p>No locations to show on map</p>
      </div>
    );
  }

  const allCoords = validHosts.map((h) => h._coords);
  const defaultCenter = allCoords[0];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <FitBounds coords={allCoords} />

      {validHosts.map((host) => {
        const price = getNightlyRate(host);
        const isActive = host.userId === activeId;
        const location = [host.district, host.city, host.country]
          .filter(Boolean)
          .join(", ");

        return (
          <Marker
            key={host.userId}
            position={host._coords}
            icon={createPriceIcon(price, false)}
            eventHandlers={{
              click: () => navigate(`/rooms/${host.userId}`),
            }}
          />
        );
      })}
    </MapContainer>
  );
};

export default SearchResultsMap;

