import { useCallback, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../components/Navbar.css";
import { getHostSuggestions } from "../services/hostsService";
import {
  getNightlyRate,
  getTaxPercent,
  hasAmenity,
  isGuestFavorite,
} from "../utils/hostUtils";
import { getOptimizedImageUrl } from "../utils/imageUtils";

const ITEMS_PER_PAGE = 20;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "host_suggestions_cache";

const HomePage = () => {
  const navigate = useNavigate();

  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search State
  const [locationQuery, setLocationQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [guestCount, setGuestCount] = useState(0);
  const [isGuestOpen, setIsGuestOpen] = useState(false);

  // Pagination, Sorting, Filtering, Tax
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [showTax, setShowTax] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());

  const [retryCount, setRetryCount] = useState(0);

  // Cache helper functions
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log("Using cached host suggestions");
          return data;
        }
      }
    } catch (err) {
      console.warn("Failed to read cache:", err);
    }
    return null;
  }, []);

  const setCachedData = useCallback((data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn("Failed to set cache:", err);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Clear cache temporarily to test fresh data
        console.log("Loading fresh data for page:", page);
        localStorage.removeItem(CACHE_KEY);

        // Fetch data for current page with server-side pagination
        const currentPage = page - 1; // Convert to 0-based for backend
        const data = await getHostSuggestions(ITEMS_PER_PAGE, currentPage);
        if (!alive) return;

        console.log(
          "Page data received:",
          data?.length || 0,
          "items for page",
          page,
        );
        console.log("Data type:", typeof data);
        console.log("Is array:", Array.isArray(data));

        const validData = Array.isArray(data) ? data : [];
        setHosts(validData);
        setCachedData(validData);
      } catch (err) {
        console.error("Failed to load hosts", err);
        if (alive) {
          setHosts([]);
          // Auto-retry once after 2 seconds on first failure
          if (retryCount === 0) {
            setTimeout(() => {
              if (alive) setRetryCount(1);
            }, 2000);
          } else {
            setError(err);
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [page, retryCount, getCachedData, setCachedData]);

  const toggleFilter = (f) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
    setPage(1);
  };

  // Filtered + sorted hosts (no client-side pagination needed now)
  const processedHosts = useMemo(() => {
    let result = [...hosts];

    // Apply filters
    if (activeFilters.has("wifi")) {
      result = result.filter((h) => hasAmenity(h, "wifi"));
    }
    if (activeFilters.has("kitchen")) {
      result = result.filter((h) => hasAmenity(h, "kitchen"));
    }
    if (activeFilters.has("favorite")) {
      result = result.filter((h) => isGuestFavorite(h));
    }

    // Apply sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => getNightlyRate(a) - getNightlyRate(b));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => getNightlyRate(b) - getNightlyRate(a));
    } else if (sortBy === "rating") {
      result.sort((a, b) => {
        const rA = a.averageRating ?? 0;
        const rB = b.averageRating ?? 0;
        return rB - rA; // Highest rated first
      });
    }

    return result;
  }, [hosts, activeFilters, sortBy]);

  // For server-side pagination, we show what we received
  const displayedHosts = processedHosts;
  const hasMoreData = hosts.length === ITEMS_PER_PAGE; // Assume more data if we got a full page

  // For pagination UI, estimate total pages (this could be improved with backend returning total count)
  const totalPages = Math.max(1, page + (hasMoreData ? 1 : 0));
  const startIdx = (page - 1) * ITEMS_PER_PAGE;

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (locationQuery) params.append("location", locationQuery);
    if (startDate) params.append("checkin", startDate.toISOString());
    if (endDate) params.append("checkout", endDate.toISOString());
    if (guestCount > 0) params.append("guests", guestCount);
    navigate(`/search?${params.toString()}`);
  };

  const getPrimaryImage = (host) =>
    host?.hostPortfolioImages?.[0] || host?.profileImage;

  const getHostTitle = (host) =>
    host?.hostDisplayName ||
    [host?.firstName, host?.lastName].filter(Boolean).join(" ");

  const getLocation = (host) =>
    host?.district
      ? `${host.district}, ${host.country}`
      : host?.city || host?.country || "Unknown Location";

  /* ── Pagination numbers ── */
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  /* ── Skeleton loader ── */
  const renderSkeletons = () =>
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="home-suggest__tile home-skeleton-card">
        <div className="home-suggest__tile-media skeleton-pulse" />
        <div className="home-suggest__tile-body">
          <div
            className="skeleton-pulse"
            style={{
              width: "70%",
              height: 16,
              borderRadius: 6,
              marginBottom: 8,
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              width: "50%",
              height: 14,
              borderRadius: 4,
              marginBottom: 6,
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              width: "40%",
              height: 14,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            className="skeleton-pulse"
            style={{ width: "30%", height: 16, borderRadius: 4 }}
          />
        </div>
      </div>
    ));

  const renderCard = (host) => {
    const img = getOptimizedImageUrl(getPrimaryImage(host));
    const title = getHostTitle(host);
    const location = getLocation(host);
    const price = getNightlyRate(host);
    const taxPct = getTaxPercent(host);
    const rating = host?.averageRating || 4.8;
    const priceWithTax = Math.round(price * (1 + taxPct / 100));

    return (
      <Link
        to={`/rooms/${host.userId}`}
        key={host.userId}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <article className="home-suggest__tile">
          <div className="home-suggest__tile-media">
            {img ? (
              <img
                src={img}
                alt={title}
                className="home-suggest__tile-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            {!img && (
              <div
                className="home-suggest__tile-img home-suggest__tile-img--empty"
                style={{ display: img ? "none" : "flex" }}
              />
            )}
            <button
              className="home-suggest__heart"
              onClick={(e) => e.preventDefault()}
            >
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                role="presentation"
                focusable="false"
                style={{
                  display: "block",
                  fill: "rgba(0,0,0,0.5)",
                  height: "24px",
                  width: "24px",
                  stroke: "white",
                  strokeWidth: 2,
                  overflow: "visible",
                }}
              >
                <path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z" />
              </svg>
            </button>
            {isGuestFavorite(host) && (
              <div className="home-suggest__badge">Guest favorite</div>
            )}
          </div>
          <div className="home-suggest__tile-body">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div className="home-suggest__tile-title">{title}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "15px",
                }}
              >
                <svg
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                  style={{
                    display: "block",
                    height: "12px",
                    width: "12px",
                    fill: "currentcolor",
                  }}
                >
                  <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.54 1.736l7.293 6.652-1.948 9.574a1.001 1.001 0 0 0 1.483 1.076l8.599-4.795 8.601 4.795a1 1 0 0 0 1.482-1.076l-1.948-9.574 7.294-6.652a1 1 0 0 0-.54-1.736l-9.86-1.27-4.126-8.885a1 1 0 0 0-1.798 0z" />
                </svg>
                <span>{rating.toFixed(2)}</span>
              </div>
            </div>
            <div className="home-suggest__tile-meta">{location}</div>
            <div className="home-suggest__tile-meta">
              Stay with {host.firstName}
            </div>
            <div className="home-suggest__tile-price">
              {showTax ? (
                <>
                  <span>${priceWithTax}</span> night
                  <span className="home-suggest__tile-tax"> incl. tax</span>
                </>
              ) : (
                <>
                  <span>${price}</span> night
                </>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <div className="page-wrapper">
      <section className="page-content" style={{ paddingTop: "140px" }}>
        <div className="container">
          <div className="home-search-section">
            <div className="home-search-bar">
              <div className="search-field">
                <label>Where</label>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  list="locations-list"
                />
                <datalist id="locations-list">
                  <option value="Dhaka" />
                  <option value="Bangkok" />
                  <option value="New York" />
                  <option value="London" />
                  <option value="Tokyo" />
                  <option value="Istanbul" />
                </datalist>
              </div>
              <div className="search-divider" />
              <div className="search-field">
                <label>Check in</label>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => setStartDate(d)}
                  placeholderText="Add dates"
                  className="date-picker-input"
                  dateFormat="MMM d"
                />
              </div>
              <div className="search-divider" />
              <div className="search-field">
                <label>Check out</label>
                <DatePicker
                  selected={endDate}
                  onChange={(d) => setEndDate(d)}
                  placeholderText="Add dates"
                  className="date-picker-input"
                  dateFormat="MMM d"
                />
              </div>
              <div className="search-divider" />
              <div
                className="search-field"
                onClick={() => setIsGuestOpen(!isGuestOpen)}
              >
                <label>Who</label>
                <div
                  style={{
                    color: guestCount > 0 ? "#222" : "#717171",
                    fontSize: "14px",
                  }}
                >
                  {guestCount > 0 ? `${guestCount} guests` : "Add guests"}
                </div>
                {isGuestOpen && (
                  <div
                    className="guest-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="guest-row">
                      <div>
                        <div className="guest-label">Adults</div>
                        <div className="guest-sub">Ages 13 or above</div>
                      </div>
                      <div className="guest-counter">
                        <button
                          onClick={() =>
                            setGuestCount(Math.max(0, guestCount - 1))
                          }
                        >
                          -
                        </button>
                        <span>{guestCount}</span>
                        <button onClick={() => setGuestCount(guestCount + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="search-button-container">
                <button className="search-button" onClick={handleSearch}>
                  <svg
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    role="presentation"
                    focusable="false"
                  >
                    <path d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container home-suggest">
          {loading ? (
            <>
              <h2
                className="home-suggest__section-title"
                style={{ marginBottom: "24px" }}
              >
                Explore homes in top destinations
              </h2>
              <div className="home-suggest__grid">{renderSkeletons()}</div>
            </>
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#717171",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#222",
                  marginBottom: 8,
                }}
              >
                Unable to load homes
              </h3>
              <p style={{ marginBottom: 20 }}>
                We encountered a connection issue. Please try again.
              </p>
              <button
                onClick={() => {
                  setError(null);
                  setRetryCount((c) => c + 1);
                }}
                style={{
                  padding: "12px 28px",
                  background: "#222",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🔄 Try Again
              </button>
            </div>
          ) : (
            <>
              <h2
                className="home-suggest__section-title"
                style={{ marginBottom: "16px" }}
              >
                Explore homes in top destinations
              </h2>

              {/* ── Toolbar: Filters + Sort + Tax Toggle ── */}
              <div className="home-toolbar">
                <div className="home-toolbar__filters">
                  <button
                    className={`filter-pill ${activeFilters.has("wifi") ? "filter-pill--active" : ""}`}
                    onClick={() => toggleFilter("wifi")}
                  >
                    📶 Wifi
                  </button>
                  <button
                    className={`filter-pill ${activeFilters.has("kitchen") ? "filter-pill--active" : ""}`}
                    onClick={() => toggleFilter("kitchen")}
                  >
                    🍳 Kitchen
                  </button>
                  <button
                    className={`filter-pill ${activeFilters.has("favorite") ? "filter-pill--active" : ""}`}
                    onClick={() => toggleFilter("favorite")}
                  >
                    ⭐ Guest favorite
                  </button>
                </div>

                <div className="home-toolbar__right">
                  <select
                    className="home-sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="default">Sort by</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>

                  <label className="home-tax-toggle">
                    <span>Display total before taxes</span>
                    <div
                      className={`toggle-switch ${showTax ? "toggle-switch--on" : ""}`}
                      onClick={() => setShowTax(!showTax)}
                    >
                      <div className="toggle-switch__knob" />
                    </div>
                  </label>
                </div>
              </div>

              {/* Showing info */}
              <div className="home-pagination-info">
                {displayedHosts.length > 0 ? (
                  <>
                    Showing {startIdx + 1}–{startIdx + displayedHosts.length} of{" "}
                    {displayedHosts.length} homes
                    {hasMoreData && " (more pages available)"}
                  </>
                ) : (
                  <>Showing 0 homes</>
                )}
              </div>

              {hosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#717171",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#222",
                      marginBottom: 8,
                    }}
                  >
                    No homes found
                  </h3>
                  <p>Check back later for new listings.</p>
                </div>
              ) : processedHosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 0",
                    color: "#717171",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#222",
                      marginBottom: 8,
                    }}
                  >
                    No homes match your filters
                  </h3>
                  <p>Try removing some filters to see more results.</p>
                </div>
              ) : (
                <>
                  <div className="home-suggest__grid">
                    {displayedHosts.map((h) => renderCard(h))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav
                      className="home-pagination"
                      aria-label="Page navigation"
                    >
                      <button
                        className="home-pagination__btn home-pagination__btn--arrow"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        ‹
                      </button>
                      {getPageNumbers().map((p, i) =>
                        p === "..." ? (
                          <span
                            key={`dots-${i}`}
                            className="home-pagination__dots"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            className={`home-pagination__btn ${p === page ? "home-pagination__btn--active" : ""}`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </button>
                        ),
                      )}
                      <button
                        className="home-pagination__btn home-pagination__btn--arrow"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        ›
                      </button>
                    </nav>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />

      <style>{`
        .date-picker-input { border: none; width: 100%; font-family: inherit; font-size: 14px; color: #222; background: transparent; outline: none; cursor: pointer; }
        .guest-dropdown { position: absolute; top: 100%; right: 0; background: white; padding: 16px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 300px; z-index: 10; margin-top: 12px; }
        .guest-row { display: flex; justify-content: space-between; align-items: center; }
        .guest-label { font-weight: 600; color: #222; }
        .guest-sub { font-size: 12px; color: #717171; }
        .guest-counter { display: flex; align-items: center; gap: 12px; }
        .guest-counter button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ddd; background: white; display: grid; place-items: center; color: #717171; }
        .guest-counter button:hover { border-color: #222; color: #222; }
      `}</style>
    </div>
  );
};

export default HomePage;
