import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getBookingsByHost } from "../services/bookingService";
import api from "../utils/axiosConfig";
import { getNightlyRate, getTaxPercent } from "../utils/hostUtils";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import "./HostDashboardPage.css";

/* ── Status configs ── */
const STATUS_CONFIG = {
  PENDING:    { label: "Pending",    color: "#856404", bg: "#ffeeba", icon: "⏳" },
  CONFIRMED:  { label: "Confirmed",  color: "#155724", bg: "#d4edda", icon: "✅" },
  CANCELLED:  { label: "Cancelled",  color: "#721c24", bg: "#f8d7da", icon: "❌" },
  CHECKED_IN: { label: "Checked In", color: "#004085", bg: "#cce5ff", icon: "🏨" },
  COMPLETED:  { label: "Completed",  color: "#0c5460", bg: "#d1ecf1", icon: "🎉" },
  REFUNDED:   { label: "Refunded",   color: "#383d41", bg: "#e2e3e5", icon: "💸" },
};

const PAYMENT_CONFIG = {
  PENDING:   { label: "Payment Pending", color: "#856404", bg: "#ffeeba" },
  COMPLETED: { label: "Paid",            color: "#155724", bg: "#d4edda" },
  PAY_LATER: { label: "Yet to Pay",      color: "#0c5460", bg: "#d1ecf1" },
  FAILED:    { label: "Payment Failed",  color: "#721c24", bg: "#f8d7da" },
  REFUNDED:  { label: "Refunded",        color: "#383d41", bg: "#e2e3e5" },
};

const HostDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("calendar");
  const [bookings, setBookings] = useState([]);
  const [guestDetails, setGuestDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "HOST") {
      navigate("/login");
      return;
    }
    loadHostData();
    // eslint-disable-next-line
  }, [user]);

  const loadHostData = async () => {
    setLoading(true);
    try {
      const data = await getBookingsByHost(user.userId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(data);

      // Fetch guest names
      const ids = [...new Set(data.map((b) => b.guestId))];
      const details = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await api.get(`/api/users/${id}`);
            details[id] = res.data;
          } catch {
            details[id] = { firstName: "Unknown", lastName: "" };
          }
        })
      );
      setGuestDetails(details);
    } catch (err) {
      console.error("Failed to load host data", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────── CALENDAR TAB ─────────────── */
  const calendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDow = firstDay.getDay(); // 0=Sun

    // Build date-to-bookings map
    const dateMap = {};
    bookings.forEach((b) => {
      if (b.status === "CANCELLED" || b.status === "REFUNDED") return;
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        if (d.getFullYear() === year && d.getMonth() === month) {
          const key = d.getDate();
          if (!dateMap[key]) dateMap[key] = [];
          dateMap[key].push(b);
        }
      }
    });

    return { daysInMonth, startDow, dateMap };
  }, [calendarMonth, bookings]);

  const navigateMonth = (offset) => {
    setCalendarMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startDow, dateMap } = calendarData;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < startDow; i++) {
      cells.push(<div key={`empty-${i}`} className="hd-cal__cell hd-cal__cell--empty" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const bookingsForDay = dateMap[day] || [];
      const isBooked = bookingsForDay.length > 0;
      const today = new Date();
      const isToday = day === today.getDate() && calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear();

      cells.push(
        <div
          key={day}
          className={`hd-cal__cell ${isBooked ? "hd-cal__cell--booked" : "hd-cal__cell--free"} ${isToday ? "hd-cal__cell--today" : ""}`}
        >
          <span className="hd-cal__day-num">{day}</span>
          {isBooked ? (
            <div className="hd-cal__booking-info">
              {bookingsForDay.map((b, idx) => (
                <div key={idx} className="hd-cal__booking-chip" onClick={() => navigate(`/booking/${b.id}`)} title={`Booking #${b.id?.substring(0, 8)}`}>
                  <span className="hd-cal__chip-icon">📌</span>
                  <span className="hd-cal__chip-id">#{b.id?.substring(0, 6)}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="hd-cal__free-label">Free</span>
          )}
        </div>
      );
    }

    return (
      <div className="hd-calendar">
        <div className="hd-cal__header">
          <button className="hd-cal__nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
          <h3 className="hd-cal__month-title">
            {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <button className="hd-cal__nav-btn" onClick={() => navigateMonth(1)}>›</button>
        </div>

        <div className="hd-cal__legend">
          <span className="hd-cal__legend-item"><span className="hd-cal__legend-dot hd-cal__legend-dot--booked" /> Booked</span>
          <span className="hd-cal__legend-item"><span className="hd-cal__legend-dot hd-cal__legend-dot--free" /> Available</span>
          <span className="hd-cal__legend-item"><span className="hd-cal__legend-dot hd-cal__legend-dot--today" /> Today</span>
        </div>

        <div className="hd-cal__grid">
          {dayNames.map((d) => (
            <div key={d} className="hd-cal__day-name">{d}</div>
          ))}
          {cells}
        </div>

        {/* List of bookings for this month */}
        <div className="hd-cal__month-bookings">
          <h4>Bookings this month</h4>
          {bookings.filter((b) => {
            if (b.status === "CANCELLED" || b.status === "REFUNDED") return false;
            const start = new Date(b.checkInDate);
            const end = new Date(b.checkOutDate);
            const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
            const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
            return start <= monthEnd && end >= monthStart;
          }).length === 0 ? (
            <p className="hd-cal__no-bookings">No bookings this month — all dates are available!</p>
          ) : (
            <div className="hd-cal__booking-list">
              {bookings.filter((b) => {
                if (b.status === "CANCELLED" || b.status === "REFUNDED") return false;
                const start = new Date(b.checkInDate);
                const end = new Date(b.checkOutDate);
                const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                const monthEnd = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
                return start <= monthEnd && end >= monthStart;
              }).map((b) => {
                const guest = guestDetails[b.guestId] || {};
                const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={b.id} className="hd-cal__booking-row" onClick={() => navigate(`/booking/${b.id}`)}>
                    <div className="hd-cal__booking-dates">
                      {new Date(b.checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" — "}
                      {new Date(b.checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="hd-cal__booking-guest">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <span className="hd-cal__booking-status" style={{ color: status.color, background: status.bg }}>
                      {status.icon} {status.label}
                    </span>
                    <span className="hd-cal__booking-id">#{b.id?.substring(0, 8)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ─────────── HOSTED HOMES TAB ─────────── */
  const renderHostedHomes = () => {
    // Current logged-in user IS a host, so show their property info
    // A host's properties are derived from the user data itself
    // In a multi-property system, we'd have a listings collection,
    // but in this schema each host IS a property listing
    const hostData = user;
    const rate = getNightlyRate(hostData);
    const taxPct = getTaxPercent(hostData);

    return (
      <div className="hd-homes">
        <h3 className="hd-homes__title">Your Hosted Properties</h3>
        <p className="hd-homes__subtitle">Manage and view your hosted homes</p>

        <div className="hd-homes__grid">
          {/* Primary listing card */}
          <div className="hd-home-card">
            <div className="hd-home-card__img-wrap">
              {hostData?.hostPortfolioImages?.[0] ? (
                <img src={hostData.hostPortfolioImages[0]} alt={hostData.hostDisplayName} className="hd-home-card__img" />
              ) : (
                <div className="hd-home-card__img-placeholder">🏡</div>
              )}
              <span className="hd-home-card__type-badge">{hostData?.propertyTypesOffered?.[0] || "Property"}</span>
            </div>
            <div className="hd-home-card__body">
              <h4 className="hd-home-card__name">{hostData?.hostDisplayName || `${hostData?.firstName}'s Place`}</h4>
              <p className="hd-home-card__location">
                📍 {[hostData?.area, hostData?.district, hostData?.city, hostData?.country].filter(Boolean).join(", ")}
              </p>
              <div className="hd-home-card__stats">
                <div className="hd-home-stat">
                  <span className="hd-home-stat__label">Nightly Rate</span>
                  <span className="hd-home-stat__value">${rate}</span>
                </div>
                <div className="hd-home-stat">
                  <span className="hd-home-stat__label">Tax</span>
                  <span className="hd-home-stat__value">{taxPct}%</span>
                </div>
                <div className="hd-home-stat">
                  <span className="hd-home-stat__label">Capacity</span>
                  <span className="hd-home-stat__value">{hostData?.guestCapacity || 2} guests</span>
                </div>
                <div className="hd-home-stat">
                  <span className="hd-home-stat__label">Beds</span>
                  <span className="hd-home-stat__value">{hostData?.bedCount || 1}</span>
                </div>
              </div>
              <div className="hd-home-card__rating">
                {hostData?.averageRating ? (
                  <>★ {hostData.averageRating.toFixed(2)} ({hostData.reviewCount || 0} reviews)</>
                ) : (
                  "No reviews yet"
                )}
              </div>
              <div className="hd-home-card__amenities">
                {hostData?.offeringHighlights?.map((h, i) => (
                  <span key={i} className="hd-amenity-tag">{h}</span>
                ))}
              </div>
              {hostData?.payLaterAllowed && (
                <span className="hd-home-card__pay-later-badge">💳 Pay Later Available</span>
              )}
              <div className="hd-home-card__gallery">
                {hostData?.hostPortfolioImages?.slice(1, 5).map((img, i) => (
                  <img key={i} src={img} alt={`Gallery ${i + 1}`} className="hd-home-card__gallery-img" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────── BOOKINGS TAB ─────────── */
  const filteredBookings = statusFilter === "ALL" ? bookings : bookings.filter((b) => b.status === statusFilter);

  const renderBookings = () => (
    <div className="hd-bookings">
      <h3 className="hd-bookings__title">Guest Bookings</h3>
      <p className="hd-bookings__subtitle">View and manage all reservations for your property</p>

      {/* Status filter pills */}
      <div className="hd-bookings__filters">
        <button className={`hd-filter-pill ${statusFilter === "ALL" ? "hd-filter-pill--active" : ""}`} onClick={() => setStatusFilter("ALL")}>
          All ({bookings.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = bookings.filter((b) => b.status === key).length;
          if (count === 0) return null;
          return (
            <button key={key} className={`hd-filter-pill ${statusFilter === key ? "hd-filter-pill--active" : ""}`} onClick={() => setStatusFilter(key)}>
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Booking cards */}
      {filteredBookings.length === 0 ? (
        <div className="hd-empty">
          <div className="hd-empty__icon">📭</div>
          <h4>No bookings found</h4>
          <p>{statusFilter === "ALL" ? "You haven't received any bookings yet." : `No ${STATUS_CONFIG[statusFilter]?.label.toLowerCase()} bookings.`}</p>
        </div>
      ) : (
        <div className="hd-bookings__list">
          {filteredBookings.map((b) => {
            const guest = guestDetails[b.guestId] || {};
            const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING;
            const payment = PAYMENT_CONFIG[b.paymentStatus] || PAYMENT_CONFIG.PENDING;
            const nights = Math.max(1, (new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24));

            return (
              <div key={b.id} className="hd-booking-card" onClick={() => navigate(`/booking/${b.id}`)}>
                <div className="hd-booking-card__top">
                  <div className="hd-booking-card__guest">
                    <div className="hd-booking-card__avatar">
                      {guest.profileImage ? (
                        <img src={guest.profileImage} alt="" />
                      ) : (
                        <span>{guest.firstName?.charAt(0) || "?"}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="hd-booking-card__guest-name">{guest.firstName} {guest.lastName}</h4>
                      <p className="hd-booking-card__guest-email">{guest.email}</p>
                    </div>
                  </div>
                  <div className="hd-booking-card__badges">
                    <span className="hd-status-badge" style={{ color: status.color, background: status.bg }}>
                      {status.icon} {status.label}
                    </span>
                    <span className="hd-status-badge" style={{ color: payment.color, background: payment.bg }}>
                      {payment.label}
                    </span>
                  </div>
                </div>

                <div className="hd-booking-card__details">
                  <div className="hd-booking-card__detail">
                    <span className="hd-detail-label">Check-in</span>
                    <span className="hd-detail-value">{new Date(b.checkInDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="hd-booking-card__detail">
                    <span className="hd-detail-label">Check-out</span>
                    <span className="hd-detail-value">{new Date(b.checkOutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="hd-booking-card__detail">
                    <span className="hd-detail-label">Duration</span>
                    <span className="hd-detail-value">{nights} night{nights > 1 ? "s" : ""}</span>
                  </div>
                  <div className="hd-booking-card__detail">
                    <span className="hd-detail-label">Total</span>
                    <span className="hd-detail-value hd-detail-value--price">${b.totalPrice}</span>
                  </div>
                </div>

                <div className="hd-booking-card__footer">
                  <span className="hd-booking-card__id">Booking #{b.id?.substring(0, 8)}</span>
                  <span className="hd-booking-card__arrow">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (!user || user.role !== "HOST") {
    return (
      <div className="hd-page">
        <div className="hd-container">
          <h2>Access Denied</h2>
          <p>Only hosts can access the dashboard.</p>
          <button className="hd-btn hd-btn--primary" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hd-page">
      <div className="hd-container">
        {/* Dashboard header */}
        <div className="hd-header">
          <div className="hd-header__info">
            <h1 className="hd-header__title">Host Dashboard</h1>
            <p className="hd-header__welcome">Welcome back, {user.firstName}! 👋</p>
          </div>
          <div className="hd-header__stats-row">
            <div className="hd-stat-card">
              <span className="hd-stat-card__number">{bookings.length}</span>
              <span className="hd-stat-card__label">Total Bookings</span>
            </div>
            <div className="hd-stat-card">
              <span className="hd-stat-card__number">{bookings.filter((b) => b.status === "CONFIRMED").length}</span>
              <span className="hd-stat-card__label">Confirmed</span>
            </div>
            <div className="hd-stat-card">
              <span className="hd-stat-card__number">{bookings.filter((b) => b.status === "PENDING").length}</span>
              <span className="hd-stat-card__label">Pending</span>
            </div>
            <div className="hd-stat-card">
              <span className="hd-stat-card__number">${bookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0).toFixed(0)}</span>
              <span className="hd-stat-card__label">Total Revenue</span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="hd-tabs">
          <button className={`hd-tab ${activeTab === "calendar" ? "hd-tab--active" : ""}`} onClick={() => setActiveTab("calendar")}>
            📅 Calendar
          </button>
          <button className={`hd-tab ${activeTab === "homes" ? "hd-tab--active" : ""}`} onClick={() => setActiveTab("homes")}>
            🏡 Hosted Homes
          </button>
          <button className={`hd-tab ${activeTab === "bookings" ? "hd-tab--active" : ""}`} onClick={() => setActiveTab("bookings")}>
            📋 Bookings
          </button>
        </div>

        {/* Tab content */}
        <div className="hd-tab-content">
          {loading ? (
            <div className="hd-loading">
              <div className="spinner" />
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {activeTab === "calendar" && renderCalendar()}
              {activeTab === "homes" && renderHostedHomes()}
              {activeTab === "bookings" && renderBookings()}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HostDashboardPage;
