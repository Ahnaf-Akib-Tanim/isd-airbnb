/**
 * Host data utilities - generates consistent random values per host
 * using a simple string hash so values are stable across renders.
 */

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Returns a consistent random float between min and max for a given host + seed */
export function seededRandom(hostId, seed = "default", min = 0, max = 1) {
  const h = hashCode(`${hostId}-${seed}`);
  const norm = (h % 10000) / 10000; // 0..0.9999
  return min + norm * (max - min);
}

/** Per-night rate: $5-$60, consistent per host */
export function getNightlyRate(host) {
  if (host?.nightlyRateUsd != null && host.nightlyRateUsd > 0) {
    return Math.round(host.nightlyRateUsd);
  }
  return Math.round(seededRandom(host?.userId || host?.id || "x", "price", 5, 60));
}

/** Tax percentage: 0.01% - 5%, consistent per host */
export function getTaxPercent(host) {
  return parseFloat(seededRandom(host?.userId || host?.id || "x", "tax", 0.01, 5).toFixed(2));
}

/** Total with tax */
export function getPriceWithTax(nightlyRate, nights, taxPercent) {
  const subtotal = nightlyRate * nights;
  const tax = subtotal * (taxPercent / 100);
  return Math.round(subtotal + tax);
}

/** Check if host has a specific amenity */
export function hasAmenity(host, amenity) {
  const highlights = host?.offeringHighlights || [];
  const q = amenity.toLowerCase();
  return highlights.some((h) => h?.toLowerCase().includes(q));
}

/** Check if host is "Guest favorite" (superhost or high rating) */
export function isGuestFavorite(host) {
  return host?.superhost || (host?.averageRating && host.averageRating >= 4.7);
}
