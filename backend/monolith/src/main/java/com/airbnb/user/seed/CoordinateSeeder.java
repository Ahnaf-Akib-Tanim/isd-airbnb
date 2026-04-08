package com.airbnb.user.seed;

import com.airbnb.user.model.User;
import com.airbnb.user.service.UserPersistenceService;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Runs once at startup and backfills lat/lng for all hosts that are missing
 * coordinates. Uses a city/district name lookup table (same as the frontend
 * fallback) and adds a tiny seeded jitter so hosts in the same city appear
 * as distinct markers on the map.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(10) // run after other seeders
public class CoordinateSeeder implements CommandLineRunner {

    private final UserPersistenceService userPersistenceService;

    // ── Lookup table ────────────────────────────────────────────────────────
    // Key: lower-case city / district / area name   Value: [lat, lng]
    private static final Map<String, double[]> CITY_COORDS = new LinkedHashMap<>();

    static {
        // Bangladesh – Dhaka neighbourhoods
        CITY_COORDS.put("banani",        new double[]{23.7937, 90.4067});
        CITY_COORDS.put("gulshan",       new double[]{23.7878, 90.4148});
        CITY_COORDS.put("dhanmondi",     new double[]{23.7461, 90.3742});
        CITY_COORDS.put("mirpur",        new double[]{23.8223, 90.3654});
        CITY_COORDS.put("uttara",        new double[]{23.8759, 90.3795});
        CITY_COORDS.put("motijheel",     new double[]{23.7338, 90.4178});
        CITY_COORDS.put("mohammadpur",   new double[]{23.7639, 90.3561});
        CITY_COORDS.put("bashundhara",   new double[]{23.8134, 90.4271});
        CITY_COORDS.put("wari",          new double[]{23.7191, 90.4146});
        CITY_COORDS.put("lalbagh",       new double[]{23.7196, 90.3867});
        CITY_COORDS.put("azimpur",       new double[]{23.7260, 90.3877});
        CITY_COORDS.put("demra",         new double[]{23.7080, 90.4713});
        CITY_COORDS.put("shyampur",      new double[]{23.6977, 90.4344});
        CITY_COORDS.put("badda",         new double[]{23.7804, 90.4296});
        CITY_COORDS.put("mohakhali",     new double[]{23.7807, 90.4030});
        CITY_COORDS.put("khilgaon",      new double[]{23.7457, 90.4302});
        CITY_COORDS.put("rampura",       new double[]{23.7566, 90.4234});
        // Bangladesh – cities
        CITY_COORDS.put("dhaka",         new double[]{23.8103, 90.4125});
        CITY_COORDS.put("chittagong",    new double[]{22.3569, 91.7832});
        CITY_COORDS.put("sylhet",        new double[]{24.8949, 91.8687});
        CITY_COORDS.put("rajshahi",      new double[]{24.3745, 88.6042});
        CITY_COORDS.put("khulna",        new double[]{22.8456, 89.5403});
        CITY_COORDS.put("barisal",       new double[]{22.7010, 90.3535});
        CITY_COORDS.put("rangpur",       new double[]{25.7439, 89.2752});
        CITY_COORDS.put("mymensingh",    new double[]{24.7471, 90.4203});
        CITY_COORDS.put("comilla",       new double[]{23.4607, 91.1809});
        CITY_COORDS.put("narayanganj",   new double[]{23.6238, 90.4996});
        // Pakistan
        CITY_COORDS.put("islamabad",     new double[]{33.6844, 73.0479});
        CITY_COORDS.put("karachi",       new double[]{24.8607, 67.0011});
        CITY_COORDS.put("lahore",        new double[]{31.5204, 74.3587});
        CITY_COORDS.put("peshawar",      new double[]{34.0151, 71.5249});
        CITY_COORDS.put("quetta",        new double[]{30.1798, 66.9750});
        CITY_COORDS.put("multan",        new double[]{30.1575, 71.5249});
        CITY_COORDS.put("faisalabad",    new double[]{31.4504, 73.1350});
        // India
        CITY_COORDS.put("mumbai",        new double[]{19.0760, 72.8777});
        CITY_COORDS.put("delhi",         new double[]{28.7041, 77.1025});
        CITY_COORDS.put("new delhi",     new double[]{28.6139, 77.2090});
        CITY_COORDS.put("bangalore",     new double[]{12.9716, 77.5946});
        CITY_COORDS.put("hyderabad",     new double[]{17.3850, 78.4867});
        CITY_COORDS.put("chennai",       new double[]{13.0827, 80.2707});
        CITY_COORDS.put("kolkata",       new double[]{22.5726, 88.3639});
        CITY_COORDS.put("pune",          new double[]{18.5204, 73.8567});
        CITY_COORDS.put("jaipur",        new double[]{26.9124, 75.7873});
        CITY_COORDS.put("surat",         new double[]{21.1702, 72.8311});
        CITY_COORDS.put("ahmedabad",     new double[]{23.0225, 72.5714});
        CITY_COORDS.put("goa",           new double[]{15.2993, 74.1240});
        // Southeast Asia
        CITY_COORDS.put("bangkok",       new double[]{13.7563, 100.5018});
        CITY_COORDS.put("singapore",     new double[]{1.3521,  103.8198});
        CITY_COORDS.put("kuala lumpur",  new double[]{3.1390,  101.6869});
        CITY_COORDS.put("jakarta",       new double[]{-6.2088, 106.8456});
        CITY_COORDS.put("manila",        new double[]{14.5995, 120.9842});
        CITY_COORDS.put("ho chi minh",   new double[]{10.8231, 106.6297});
        CITY_COORDS.put("hanoi",         new double[]{21.0285, 105.8542});
        CITY_COORDS.put("phnom penh",    new double[]{11.5564, 104.9282});
        CITY_COORDS.put("yangon",        new double[]{16.8661,  96.1951});
        // East Asia
        CITY_COORDS.put("tokyo",         new double[]{35.6762, 139.6503});
        CITY_COORDS.put("beijing",       new double[]{39.9042, 116.4074});
        CITY_COORDS.put("shanghai",      new double[]{31.2304, 121.4737});
        CITY_COORDS.put("seoul",         new double[]{37.5665, 126.9780});
        CITY_COORDS.put("hong kong",     new double[]{22.3193, 114.1694});
        CITY_COORDS.put("taipei",        new double[]{25.0330, 121.5654});
        // Middle East
        CITY_COORDS.put("dubai",         new double[]{25.2048,  55.2708});
        CITY_COORDS.put("abu dhabi",     new double[]{24.4539,  54.3773});
        CITY_COORDS.put("istanbul",      new double[]{41.0082,  28.9784});
        CITY_COORDS.put("riyadh",        new double[]{24.7136,  46.6753});
        CITY_COORDS.put("cairo",         new double[]{30.0444,  31.2357});
        // Europe
        CITY_COORDS.put("london",        new double[]{51.5074,  -0.1278});
        CITY_COORDS.put("paris",         new double[]{48.8566,   2.3522});
        CITY_COORDS.put("berlin",        new double[]{52.5200,  13.4050});
        CITY_COORDS.put("madrid",        new double[]{40.4168,  -3.7038});
        CITY_COORDS.put("rome",          new double[]{41.9028,  12.4964});
        CITY_COORDS.put("amsterdam",     new double[]{52.3676,   4.9041});
        CITY_COORDS.put("barcelona",     new double[]{41.3851,   2.1734});
        CITY_COORDS.put("vienna",        new double[]{48.2082,  16.3738});
        CITY_COORDS.put("prague",        new double[]{50.0755,  14.4378});
        CITY_COORDS.put("stockholm",     new double[]{59.3293,  18.0686});
        // Americas
        CITY_COORDS.put("new york",      new double[]{40.7128, -74.0060});
        CITY_COORDS.put("los angeles",   new double[]{34.0522, -118.2437});
        CITY_COORDS.put("chicago",       new double[]{41.8781,  -87.6298});
        CITY_COORDS.put("toronto",       new double[]{43.6532,  -79.3832});
        CITY_COORDS.put("vancouver",     new double[]{49.2827, -123.1207});
        CITY_COORDS.put("mexico city",   new double[]{19.4326,  -99.1332});
        CITY_COORDS.put("sao paulo",     new double[]{-23.5505, -46.6333});
        CITY_COORDS.put("buenos aires",  new double[]{-34.6037, -58.3816});
        // Oceania
        CITY_COORDS.put("sydney",        new double[]{-33.8688, 151.2093});
        CITY_COORDS.put("melbourne",     new double[]{-37.8136, 144.9631});
        CITY_COORDS.put("auckland",      new double[]{-36.8509, 174.7645});
    }

    @Override
    public void run(String... args) {
        log.info("CoordinateSeeder: checking for hosts with missing coordinates...");

        List<User> hosts = userPersistenceService.findAllHosts();
        int patched = 0;

        for (User host : hosts) {
            if (host.getLatitude() != null && host.getLongitude() != null) {
                continue; // already has real coordinates
            }

            double[] coords = resolveCoords(host);
            if (coords == null) {
                log.warn("CoordinateSeeder: no coords found for host {} ({})",
                        host.getUserId(), locationSummary(host));
                continue;
            }

            // Apply a tiny seeded jitter (±0.012°, ~1.3 km) so hosts in the
            // same city don't stack as a single marker on the map.
            double jitterLat = seededOffset(host.getUserId(), "lat");
            double jitterLng = seededOffset(host.getUserId(), "lng");

            host.setLatitude(coords[0] + jitterLat);
            host.setLongitude(coords[1] + jitterLng);
            userPersistenceService.save(host);
            patched++;
            log.debug("CoordinateSeeder: patched {} -> {}, {}",
                    host.getUserId(), host.getLatitude(), host.getLongitude());
        }

        if (patched > 0) {
            log.info("CoordinateSeeder: patched coordinates for {} host(s).", patched);
        } else {
            log.info("CoordinateSeeder: all hosts already have coordinates.");
        }
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    /** Try location fields using substring matching, then text fields, then fallback. */
    private double[] resolveCoords(User host) {
        // 1. Direct address fields
        String[] addressFields = {
            host.getArea(),
            host.getDistrict(),
            host.getVillage(),
            host.getCity(),
            host.getDivision(),
            host.getCountry()
        };

        // 2. Text fields that often contain city names (e.g. "Condo in Dhaka")
        String[] textFields = {
            host.getHostDisplayName(),
            host.getHostAbout(),
            host.getBio()
        };

        List<String> keys = new java.util.ArrayList<>(CITY_COORDS.keySet());
        keys.sort((a, b) -> b.length() - a.length()); // Longest first

        // Try address fields (exact or partial match)
        for (String candidate : addressFields) {
            double[] match = findMatch(candidate, keys);
            if (match != null) return match;
        }

        // Try text fields (only if the text CONTAINS a known city)
        for (String candidate : textFields) {
            if (candidate == null || candidate.isBlank()) continue;
            String text = candidate.toLowerCase();
            for (String key : keys) {
                if (text.contains(key)) return CITY_COORDS.get(key);
            }
        }

        // 3. Absolute Fallback: if we still have no coordinates, deterministically
        // place them in one of the major cities based on a hash of their ID,
        // so NO host is ever left entirely off the map.
        String[] fallbackKeys = {"dhaka", "istanbul", "bangkok", "new york", "london"};
        int hash = Math.abs(host.getUserId().hashCode());
        String chosenFallback = fallbackKeys[hash % fallbackKeys.length];
        return CITY_COORDS.get(chosenFallback);
    }

    private double[] findMatch(String candidate, List<String> keys) {
        if (candidate == null || candidate.isBlank()) return null;
        String field = candidate.trim().toLowerCase();

        if (CITY_COORDS.containsKey(field)) return CITY_COORDS.get(field);

        for (String key : keys) {
            if (field.contains(key)) return CITY_COORDS.get(key);
        }

        if (field.length() >= 4) {
            for (String key : keys) {
                if (key.contains(field)) return CITY_COORDS.get(key);
            }
        }
        return null;
    }

    /**
     * Returns a deterministic offset in [-0.012, +0.012] degrees for a given
     * hostId + axis label, so two calls with different labels give independent
     * offsets.
     */
    private double seededOffset(String hostId, String axis) {
        int hash = (hostId + "-" + axis).hashCode();
        // Map hash to [-1, 1] then scale
        double norm = ((hash & 0x7fffffff) % 10000) / 10000.0; // 0..0.9999
        return (norm * 2.0 - 1.0) * 0.012; // ±0.012°
    }

    private String locationSummary(User host) {
        return String.join(", ",
                nullSafe(host.getArea()),
                nullSafe(host.getDistrict()),
                nullSafe(host.getCity()),
                nullSafe(host.getCountry()));
    }

    private String nullSafe(String s) {
        return s != null ? s : "?";
    }
}
