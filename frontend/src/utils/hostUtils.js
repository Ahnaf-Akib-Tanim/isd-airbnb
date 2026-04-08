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

function uniqueCaseInsensitive(values) {
  return values.filter((value, index, list) => {
    return (
      list.findIndex((candidate) => {
        return candidate.toLowerCase() === value.toLowerCase();
      }) === index
    );
  });
}

function pushAmenity(target, value) {
  if (typeof value !== "string") {
    return;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  target.push(trimmed);
}

const BOOLEAN_AMENITY_MAP = [
  ["hasWiFi", "WiFi"],
  ["hasKitchen", "Kitchen"],
  ["hasParking", "Parking"],
  ["hasPool", "Pool"],
  ["hasGym", "Gym"],
  ["hasHeating", "Heating"],
  ["hasAirConditioning", "Air Conditioning"],
  ["hasWasher", "Washer"],
  ["hasDryer", "Dryer"],
  ["hasTV", "TV"],
  ["hasWorkspace", "Workspace"],
  ["hasElevator", "Elevator"],
];

export const TOP_OFFERING_FILTERS = [
  { key: "wifi", label: "WiFi", amenity: "WiFi" },
  {
    key: "air-conditioning",
    label: "Air conditioning",
    amenity: "Air Conditioning",
  },
  { key: "kitchen", label: "Kitchen", amenity: "Kitchen" },
  { key: "parking", label: "Parking", amenity: "Parking" },
  { key: "pool", label: "Pool", amenity: "Pool" },
];

function collectBooleanAmenityOverrides(property) {
  const enabled = new Set();
  const disabled = new Set();

  BOOLEAN_AMENITY_MAP.forEach(([flag, amenity]) => {
    if (property?.[flag] === true) {
      enabled.add(amenity.toLowerCase());
    }
    if (property?.[flag] === false) {
      disabled.add(amenity.toLowerCase());
    }
  });

  return { enabled, disabled };
}

export function getPrimaryHostedProperty(host) {
  return Array.isArray(host?.hostedProperties) &&
    host.hostedProperties.length > 0
    ? host.hostedProperties[0]
    : null;
}

export function getHostAmenities(host) {
  const amenities = [];
  const hostedProperties = Array.isArray(host?.hostedProperties)
    ? host.hostedProperties
    : [];
  const propertyAmenities = [];

  hostedProperties.forEach((property) => {
    const { enabled, disabled } = collectBooleanAmenityOverrides(property);

    (property?.amenities || []).forEach((amenity) => {
      const normalizedAmenity =
        typeof amenity === "string" ? amenity.trim().toLowerCase() : "";

      if (!normalizedAmenity || disabled.has(normalizedAmenity)) {
        return;
      }

      pushAmenity(propertyAmenities, amenity);
    });

    enabled.forEach((amenity) => {
      const displayAmenity = BOOLEAN_AMENITY_MAP.find(
        ([, label]) => label.toLowerCase() === amenity,
      )?.[1];
      pushAmenity(propertyAmenities, displayAmenity);
    });
  });

  if (propertyAmenities.length > 0) {
    return uniqueCaseInsensitive(propertyAmenities);
  }

  (host?.offeringHighlights || []).forEach((highlight) => {
    pushAmenity(amenities, highlight);
  });

  return uniqueCaseInsensitive(amenities);
}

export function getHostLocationParts(host) {
  const parts = [host?.area, host?.district, host?.city, host?.country]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  return uniqueCaseInsensitive(parts);
}

export function getHostCoordinates(host) {
  const latitude = Number(host?.latitude);
  const longitude = Number(host?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return [latitude, longitude];
}

/**
 * Known approximate coordinates for major cities / districts.
 * Used as fallback when a host has no lat/lng stored.
 */
const CITY_COORDS = {
  // Bangladesh
  "dhaka": [23.8103, 90.4125],
  "chittagong": [22.3569, 91.7832],
  "sylhet": [24.8949, 91.8687],
  "rajshahi": [24.3745, 88.6042],
  "khulna": [22.8456, 89.5403],
  "barisal": [22.7010, 90.3535],
  "rangpur": [25.7439, 89.2752],
  "mymensingh": [24.7471, 90.4203],
  "comilla": [23.4607, 91.1809],
  "narayanganj": [23.6238, 90.4996],
  // Dhaka districts
  "banani": [23.7937, 90.4067],
  "gulshan": [23.7878, 90.4148],
  "dhanmondi": [23.7461, 90.3742],
  "mirpur": [23.8223, 90.3654],
  "uttara": [23.8759, 90.3795],
  "motijheel": [23.7338, 90.4178],
  "mohammadpur": [23.7639, 90.3561],
  "bashundhara": [23.8134, 90.4271],
  "wari": [23.7191, 90.4146],
  "lalbagh": [23.7196, 90.3867],
  "azimpur": [23.7260, 90.3877],
  "rayer bazar": [23.7598, 90.3560],
  "demra": [23.7080, 90.4713],
  "shyampur": [23.6977, 90.4344],
  // Pakistan
  "islamabad": [33.6844, 73.0479],
  "karachi": [24.8607, 67.0011],
  "lahore": [31.5204, 74.3587],
  "peshawar": [34.0151, 71.5249],
  "quetta": [30.1798, 66.9750],
  "multan": [30.1575, 71.5249],
  "faisalabad": [31.4504, 73.1350],
  // India
  "mumbai": [19.0760, 72.8777],
  "delhi": [28.7041, 77.1025],
  "new delhi": [28.6139, 77.2090],
  "bangalore": [12.9716, 77.5946],
  "hyderabad": [17.3850, 78.4867],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "pune": [18.5204, 73.8567],
  "jaipur": [26.9124, 75.7873],
  "surat": [21.1702, 72.8311],
  "ahmedabad": [23.0225, 72.5714],
  "goa": [15.2993, 74.1240],
  // Southeast Asia
  "bangkok": [13.7563, 100.5018],
  "singapore": [1.3521, 103.8198],
  "kuala lumpur": [3.1390, 101.6869],
  "jakarta": [-6.2088, 106.8456],
  "manila": [14.5995, 120.9842],
  "ho chi minh": [10.8231, 106.6297],
  "hanoi": [21.0285, 105.8542],
  "phnom penh": [11.5564, 104.9282],
  "yangon": [16.8661, 96.1951],
  // East Asia
  "tokyo": [35.6762, 139.6503],
  "beijing": [39.9042, 116.4074],
  "shanghai": [31.2304, 121.4737],
  "seoul": [37.5665, 126.9780],
  "hong kong": [22.3193, 114.1694],
  "taipei": [25.0330, 121.5654],
  // Middle East
  "dubai": [25.2048, 55.2708],
  "abu dhabi": [24.4539, 54.3773],
  "istanbul": [41.0082, 28.9784],
  "riyadh": [24.7136, 46.6753],
  "cairo": [30.0444, 31.2357],
  // Europe
  "london": [51.5074, -0.1278],
  "paris": [48.8566, 2.3522],
  "berlin": [52.5200, 13.4050],
  "madrid": [40.4168, -3.7038],
  "rome": [41.9028, 12.4964],
  "amsterdam": [52.3676, 4.9041],
  "barcelona": [41.3851, 2.1734],
  "vienna": [48.2082, 16.3738],
  "prague": [50.0755, 14.4378],
  "stockholm": [59.3293, 18.0686],
  // Americas
  "new york": [40.7128, -74.0060],
  "los angeles": [34.0522, -118.2437],
  "chicago": [41.8781, -87.6298],
  "toronto": [43.6532, -79.3832],
  "vancouver": [49.2827, -123.1207],
  "mexico city": [19.4326, -99.1332],
  "são paulo": [-23.5505, -46.6333],
  "buenos aires": [-34.6037, -58.3816],
  // Oceania
  "sydney": [-33.8688, 151.2093],
  "melbourne": [-37.8136, 144.9631],
  "auckland": [-36.8509, 174.7645],
};

/**
 * Returns coordinates for a host: real lat/lng if available, otherwise
 * falls back to city/district lookup using BIDIRECTIONAL substring matching
 * so "Dhanmondi 27" matches "dhanmondi", "Gulshan-1" matches "gulshan", etc.
 * Adds a tiny per-host seeded jitter so hosts in the same city or building spread out.
 */
export function getHostApproximateCoordinates(host) {
  // 1. Use real DB coordinates if available, but ALWAYS apply a micro-jitter
  // so that hosts in the exact same building don't stack to a single identical pixel!
  const real = getHostCoordinates(host);
  if (real) return _withJitter(real, host, 0.008); // ±800m spread for identical coordinates

  // 2. Collect all location fields, most-specific first
  const fields = [
    host?.area,
    host?.district,
    host?.village,
    host?.city,
    host?.division,
    host?.country,
  ]
    .filter(Boolean)
    .map((s) => s.trim().toLowerCase());

  if (fields.length === 0) return null;

  // Sort lookup keys longest-first so "new delhi" beats "delhi"
  const keys = Object.keys(CITY_COORDS).sort((a, b) => b.length - a.length);

  for (const field of fields) {
    // a) exact match
    if (CITY_COORDS[field]) return _withJitter(CITY_COORDS[field], host, 0.035);
    // b) field CONTAINS a known key ("dhanmondi 27" contains "dhanmondi")
    for (const key of keys) {
      if (field.includes(key)) return _withJitter(CITY_COORDS[key], host, 0.04);
    }
    // c) a known key CONTAINS the field ("new york city" key contains "new york")
    for (const key of keys) {
      if (key.includes(field) && field.length >= 4) return _withJitter(CITY_COORDS[key], host, 0.04);
    }
  }

  return null;
}

function _withJitter([lat, lng], host, scale = 0.035) {
  const jLat = seededRandom(host?.userId || "x", "jitter-lat", -1, 1) * scale;
  const jLng = seededRandom(host?.userId || "x", "jitter-lng", -1, 1) * scale;
  return [lat + jLat, lng + jLng];
}

export function allowsPayLater(host) {
  if (typeof host?.payLaterAllowed === "boolean") {
    return host.payLaterAllowed;
  }

  return (host?.hostedProperties || []).some(
    (property) => property?.payLaterAllowed === true,
  );
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
  return Math.round(
    seededRandom(host?.userId || host?.id || "x", "price", 40, 350),
  );
}

/** Tax percentage: 0.01% - 5%, consistent per host */
export function getTaxPercent(host) {
  return parseFloat(
    seededRandom(host?.userId || host?.id || "x", "tax", 0.01, 5).toFixed(2),
  );
}

/** Total with tax */
export function getPriceWithTax(nightlyRate, nights, taxPercent) {
  const subtotal = nightlyRate * nights;
  const tax = subtotal * (taxPercent / 100);
  return Math.round(subtotal + tax);
}

/** Check if host has a specific amenity */
export function hasAmenity(host, amenity) {
  const q = amenity.toLowerCase();
  const aliases =
    q === "wifi" ? ["wifi", "wi-fi"] : q === "kitchen" ? ["kitchen"] : [q];

  return getHostAmenities(host).some((item) => {
    const normalizedItem = item.toLowerCase();
    return aliases.some((alias) => normalizedItem.includes(alias));
  });
}

/** Check if host is "Guest favorite" (superhost or high rating) */
export function isGuestFavorite(host) {
  return host?.superhost || (host?.averageRating && host.averageRating >= 4.7);
}
