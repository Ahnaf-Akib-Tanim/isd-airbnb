import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { cancelBooking, getBookingsByGuest } from "../services/bookingService";
import api from "../utils/axiosConfig";
import "./CustomerTripsPage.css";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#b45309", bg: "#fef3c7", icon: "⏳", step: 1 },
  CONFIRMED: { label: "Confirmed", color: "#065f46", bg: "#d1fae5", icon: "✅", step: 2 },
  NOT_PAID_YET: { label: "Awaiting Payment", color: "#f59e0b", bg: "#fef3c7", icon: "💳", step: 1 },
  CHECKED_IN: { label: "Checked In", color: "#1e40af", bg: "#dbeafe", icon: "🏨", step: 3 },
  COMPLETED: { label: "Completed", color: "#065f46", bg: "#d1fae5", icon: "🎉", step: 4 },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", icon: "❌", step: -1 },
  REFUNDED: { label: "Refunded", color: "#4b5563", bg: "#e5e7eb", icon: "💸", step: -1 },
};

const PAYMENT_CONFIG = {
  PENDING: { label: "Payment Pending", color: "#b45309", bg: "#fef3c7" },
  COMPLETED: { label: "Paid", color: "#065f46", bg: "#d1fae5" },
  PAY_LATER: { label: "Pay Later", color: "#1e40af", bg: "#dbeafe" },
  FAILED: { label: "Failed", color: "#991b1b", bg: "#fee2e2" },
  REFUNDED: { label: "Refunded", color: "#4b5563", bg: "#e5e7eb" },
};

const CANCELLATION_POLICIES = {
  FLEXIBLE: {
    label: "Flexible",
    desc: "Full refund up to 24 hours before check-in",
    refundPercent: (daysLeft) => (daysLeft >= 1 ? 100 : 50),
  },
  MODERATE: {
    label: "Moderate",
    desc: "Full refund if cancelled 5+ days before check-in",
    refundPercent: (daysLeft) => (daysLeft >= 5 ? 100 : daysLeft >= 1 ? 50 : 0),
  },
  STRICT: {
    label: "Strict",
    desc: "50% refund if cancelled 7+ days before check-in",
    refundPercent: (daysLeft) => (daysLeft >= 7 ? 50 : 0),
  },
};

const STATUS_STEPS = [
  { key: "booked", label: "Booked", icon: "📝" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "checkedIn", label: "Checked In", icon: "🏨" },
  { key: "completed", label: "Completed", icon: "🎉" },
];

const CustomerTripsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [hostCache, setHostCache] = useState({});
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookingsByGuest(user.userId);
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(data);

      const hostIds = [...new Set(data.map((b) => b.hostId).filter(Boolean))];
      const cache = {};
      await Promise.all(
        hostIds.map(async (id) => {
          try {
            const res = await api.get(`/api/users/${id}`);
            cache[id] = res.data;
          } catch {
            cache[id] = { hostDisplayName: "Host", firstName: "Host" };
          }
        }),
      );
      setHostCache(cache);
    } catch (err) {
      console.error("Failed to load trips", err);
      toast.error("Failed to load your trips");
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) {
      fetchTrips();
    }
  }, [user?.userId, fetchTrips]);

  const today = new Date().toISOString().split("T")[0];

  const categorized = useMemo(() => {
    const current = [], past = [], cancelled = [];
    bookings.forEach((b) => {
      if (["CANCELLED", "REFUNDED"].includes(b.status)) {
        cancelled.push(b);
      } else if (
        ["COMPLETED"].includes(b.status) ||
        (b.checkOutDate && b.checkOutDate < today)
      ) {
        past.push(b);
      } else {
        current.push(b);
      }
    });
    return { current, past, cancelled };
  }, [bookings, today]);

  const getDaysUntilCheckIn = (checkInDate) => {
    if (!checkInDate) return 0;
    const diff = (new Date(checkInDate) - new Date()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diff));
  };

  const getRefundPercent = (booking) => {
    const policy = booking.cancellationPolicy || "MODERATE";
    const cfg = CANCELLATION_POLICIES[policy] || CANCELLATION_POLICIES.MODERATE;
    return cfg.refundPercent(getDaysUntilCheckIn(booking.checkInDate));
  };

  const handleCancelBooking = async () => {
    if (!cancelModal) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    setCancelling(true);
    try {
      await cancelBooking(cancelModal.id, cancelReason.trim());
      toast.success("Cancellation request submitted. Admin will process your refund.");
      setCancelModal(null);
      setCancelReason("");
      fetchTrips();
    } catch (err) {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = (bookingId) => {
    navigate(`/payment/${bookingId}`);
  };

  const getHost = (id) => hostCache[id] || {};
  const getNights = (b) =>
    b.checkInDate && b.checkOutDate
      ? Math.max(1, Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)))
      : 0;

  const tabs = [
    { key: "current", label: "Current Trips", count: categorized.current.length, icon: "🏠" },
    { key: "past", label: "Past Trips", count: categorized.past.length, icon: "📋" },
    { key: "cancelled", label: "Cancelled", count: categorized.cancelled.length, icon: "❌" },
  ];

  /* ── Status progress bar ── */
  const getActiveStep = (booking) => {
    const s = booking.status;
    if (s === "PENDING" || s === "NOT_PAID_YET") return 0;
    if (s === "CONFIRMED") return 1;
    if (s === "CHECKED_IN") return 2;
    if (s === "COMPLETED") return 3;
    return -1; // cancelled/refunded
  };

  const renderStatusBar = (booking) => {
    const active = getActiveStep(booking);
    if (active === -1) return null; // don't show for cancelled

    return (
      <div className="ct-status-bar">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= active;
          const isCurrent = i === active;
          return (
            <div key={step.key} className="ct-status-bar__step-wrap">
              <div className={`ct-status-bar__step ${done ? "ct-status-bar__step--done" : ""} ${isCurrent ? "ct-status-bar__step--current" : ""}`}>
                <div className="ct-status-bar__circle">
                  {done ? <span className="ct-status-bar__check">✓</span> : <span className="ct-status-bar__num">{i + 1}</span>}
                </div>
                <span className="ct-status-bar__label">{step.label}</span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`ct-status-bar__connector ${i < active ? "ct-status-bar__connector--done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderBookingCard = (booking) => {
    const host = getHost(booking.hostId);
    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const payment = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.PENDING;
    const nights = getNights(booking);
    const canCancel = ["PENDING", "CONFIRMED", "NOT_PAID_YET"].includes(booking.status);
    const canPay =
      (booking.paymentStatus === "PAY_LATER" || booking.paymentStatus === "PENDING") &&
      ["NOT_PAID_YET", "CONFIRMED"].includes(booking.status);
    const daysUntil = getDaysUntilCheckIn(booking.checkInDate);

    return (
      <div className="ct-card" key={booking.id}>
        {/* Header with image and info */}
        <div className="ct-card-header" onClick={() => navigate(`/booking/${booking.id}`)}>
          <div className="ct-card-image">
            {host.hostPortfolioImages?.[0] ? (
              <img src={host.hostPortfolioImages[0]} alt="property" />
            ) : (
              <div className="ct-card-image-placeholder">🏠</div>
            )}
          </div>
          <div className="ct-card-info">
            <h3>{host.hostDisplayName || `${host.firstName || "Host"}'s Place`}</h3>
            <p className="ct-card-location">
              📍 {host.area || host.city || host.district || "N/A"},{" "}
              {host.country || ""}
            </p>
            <div className="ct-card-meta">
              <span className="ct-meta-item">
                <span className="ct-meta-icon">📅</span>
                {booking.checkInDate
                  ? new Date(booking.checkInDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
                <span className="ct-arrow">→</span>
                {booking.checkOutDate
                  ? new Date(booking.checkOutDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </span>
              <span className="ct-meta-item">
                <span className="ct-meta-icon">🌙</span>
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
              {booking.propertyName && (
                <span className="ct-meta-item">
                  <span className="ct-meta-icon">🏡</span>
                  {booking.propertyName}
                </span>
              )}
            </div>
          </div>
          <div className="ct-card-badges">
            <span className="ct-badge" style={{ color: status.color, background: status.bg }}>
              {status.icon} {status.label}
            </span>
            <span className="ct-badge ct-badge-payment" style={{ color: payment.color, background: payment.bg }}>
              {payment.label}
            </span>
          </div>
        </div>

        {/* Status Progress Bar */}
        {renderStatusBar(booking)}

        {/* Detailed info row */}
        <div className="ct-card-details" onClick={() => navigate(`/booking/${booking.id}`)}>
          <div className="ct-detail-item">
            <span className="ct-detail-label">Check-in</span>
            <span className="ct-detail-value">
              {booking.checkInDate
                ? new Date(booking.checkInDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </span>
          </div>
          <div className="ct-detail-item">
            <span className="ct-detail-label">Check-out</span>
            <span className="ct-detail-value">
              {booking.checkOutDate
                ? new Date(booking.checkOutDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </span>
          </div>
          <div className="ct-detail-item">
            <span className="ct-detail-label">Total Price</span>
            <span className="ct-detail-value ct-detail-value--price">${booking.totalPrice}</span>
          </div>
          {booking.status !== "CANCELLED" && booking.status !== "REFUNDED" && daysUntil > 0 && (
            <div className="ct-detail-item ct-detail-item--highlight">
              <span className="ct-detail-label">Days Until Check-in</span>
              <span className="ct-detail-value">{daysUntil} day{daysUntil !== 1 ? "s" : ""}</span>
            </div>
          )}
          {booking.cancellationPolicy && (
            <div className="ct-detail-item">
              <span className="ct-detail-label">Cancellation Policy</span>
              <span className="ct-detail-value">{booking.cancellationPolicy}</span>
            </div>
          )}
        </div>

        {/* Footer with price and actions */}
        <div className="ct-card-footer">
          <div className="ct-card-price">
            <span className="ct-price-label">Total</span>
            <span className="ct-price-value">${booking.totalPrice}</span>
          </div>
          <div className="ct-card-actions" onClick={(e) => e.stopPropagation()}>
            {canPay && (
              <button className="ct-btn ct-btn-pay" onClick={() => handlePayNow(booking.id)}>
                💳 Pay Now
              </button>
            )}
            {canCancel && (
              <button className="ct-btn ct-btn-cancel" onClick={() => setCancelModal(booking)}>
                Cancel Booking
              </button>
            )}
            <button className="ct-btn ct-btn-view" onClick={() => navigate(`/booking/${booking.id}`)}>
              View Details →
            </button>
          </div>
        </div>

        <div className="ct-card-id">Booking #{booking.id?.substring(0, 8)}</div>

        {/* Show cancellation reason if cancelled */}
        {(booking.status === "CANCELLED" || booking.status === "REFUNDED") && booking.cancellationReason && (
          <div className="ct-cancellation-box">
            <div className="ct-cancellation-box__header">
              <span>❌</span>
              <strong>Cancellation Reason</strong>
              {booking.cancelledBy && <span className="ct-cancelled-by">by {booking.cancelledBy}</span>}
            </div>
            <p>{booking.cancellationReason}</p>
          </div>
        )}

        {/* Show refund info if refunded */}
        {(booking.status === "CANCELLED" || booking.status === "REFUNDED") && booking.refundAmount > 0 && (
          <div className="ct-refund-box">
            <span>💸</span>
            <div>
              <strong>Refund Amount: ${booking.refundAmount}</strong>
              {booking.status === "REFUNDED" && <p>Refund has been processed</p>}
              {booking.status === "CANCELLED" && <p>Refund will be processed by admin</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const activeBookings = categorized[activeTab] || [];

  return (
    <div className="ct-page">
      <div className="ct-container">
        <div className="ct-header">
          <h1>My Trips</h1>
          <p>Track your current, past, and cancelled bookings</p>
        </div>

        <div className="ct-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`ct-tab ${activeTab === tab.key ? "ct-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="ct-tab-icon">{tab.icon}</span>
              <span className="ct-tab-label">{tab.label}</span>
              <span className="ct-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ct-loading">
            <div className="spinner" />
            <p>Loading your trips...</p>
          </div>
        ) : activeBookings.length === 0 ? (
          <div className="ct-empty">
            <div className="ct-empty-icon">
              {activeTab === "current" ? "🏖️" : activeTab === "past" ? "📋" : "💤"}
            </div>
            <h3>No {activeTab} trips</h3>
            <p>
              {activeTab === "current"
                ? "You don't have any upcoming trips. Start exploring!"
                : activeTab === "past"
                  ? "No completed trips yet."
                  : "No cancelled bookings."}
            </p>
            {activeTab === "current" && (
              <button className="ct-btn ct-btn-explore" onClick={() => navigate("/")}>
                Explore homes
              </button>
            )}
          </div>
        ) : (
          <div className="ct-cards">
            {activeBookings.map(renderBookingCard)}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="ct-modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Booking</h2>
            <div className="ct-modal-details">
              <p><strong>Property:</strong> {getHost(cancelModal.hostId)?.hostDisplayName || "Host's Place"}</p>
              <p><strong>Dates:</strong> {cancelModal.checkInDate} → {cancelModal.checkOutDate}</p>
              <p><strong>Total Paid:</strong> ${cancelModal.totalPrice}</p>
            </div>

            <div className="ct-modal-policy">
              <h4>Cancellation Policy: {cancelModal.cancellationPolicy || "MODERATE"}</h4>
              <p>{CANCELLATION_POLICIES[cancelModal.cancellationPolicy || "MODERATE"]?.desc}</p>
              <div className="ct-refund-preview">
                <span>Estimated Refund:</span>
                <strong>
                  {getRefundPercent(cancelModal)}% — $
                  {Math.round(((cancelModal.totalPrice || 0) * getRefundPercent(cancelModal)) / 100)}
                </strong>
              </div>
            </div>

            <div className="ct-modal-reason">
              <label>Reason for cancellation *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                rows={4}
              />
            </div>

            <div className="ct-modal-actions">
              <button className="ct-btn ct-btn-secondary" onClick={() => setCancelModal(null)}>
                Keep Booking
              </button>
              <button className="ct-btn ct-btn-danger" onClick={handleCancelBooking} disabled={cancelling}>
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CustomerTripsPage;
