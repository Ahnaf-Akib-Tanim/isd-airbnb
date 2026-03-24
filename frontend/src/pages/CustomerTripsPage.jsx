import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { cancelBooking, getBookingsByGuest } from "../services/bookingService";
import api from "../utils/axiosConfig";
import "./CustomerTripsPage.css";

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#b45309", bg: "#fef3c7", icon: "⏳" },
  CONFIRMED: {
    label: "Confirmed",
    color: "#065f46",
    bg: "#d1fae5",
    icon: "✅",
  },
  NOT_PAID_YET: {
    label: "Not Paid Yet",
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: "💳",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#991b1b",
    bg: "#fee2e2",
    icon: "❌",
  },
  CHECKED_IN: {
    label: "Checked In",
    color: "#1e40af",
    bg: "#dbeafe",
    icon: "🏨",
  },
  COMPLETED: {
    label: "Completed",
    color: "#065f46",
    bg: "#d1fae5",
    icon: "🎉",
  },
  REFUNDED: { label: "Refunded", color: "#4b5563", bg: "#e5e7eb", icon: "💸" },
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

const CustomerTripsPage = () => {
  const { user } = useAuth();
  // Temporarily disable WebSocket to fix startup issues
  // const { subscribeToBookingUpdates, subscribeToPaymentUpdates } = useWebSocket();
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
      // Temporarily disabled WebSocket
      // subscribeToBookingUpdates(user.userId, 'GUEST');
      // subscribeToPaymentUpdates(user.userId);
    }
  }, [user?.userId, fetchTrips]);

  const today = new Date().toISOString().split("T")[0];

  const categorized = useMemo(() => {
    const current = [],
      past = [],
      cancelled = [];
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
      toast.success(
        "Cancellation request submitted. Admin will process your refund.",
      );
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
    navigate(`/booking/${bookingId}?action=pay`);
  };

  const getHost = (id) => hostCache[id] || {};
  const getNights = (b) =>
    b.checkInDate && b.checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(b.checkOutDate) - new Date(b.checkInDate)) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const tabs = [
    {
      key: "current",
      label: "Current Trips",
      count: categorized.current.length,
      icon: "🏠",
    },
    {
      key: "past",
      label: "Past Trips",
      count: categorized.past.length,
      icon: "📋",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: categorized.cancelled.length,
      icon: "❌",
    },
  ];

  const renderTimeline = (booking) => {
    const events = [];
    if (booking.createdAt)
      events.push({
        date: booking.createdAt,
        label: "Booking created",
        icon: "📝",
      });
    if (
      booking.status === "CONFIRMED" ||
      booking.status === "CHECKED_IN" ||
      booking.status === "COMPLETED"
    )
      events.push({
        date: booking.updatedAt,
        label: "Confirmed by admin",
        icon: "✅",
      });
    if (booking.status === "CHECKED_IN" || booking.status === "COMPLETED")
      events.push({
        date: booking.checkInDate,
        label: "Checked in",
        icon: "🏨",
      });
    if (booking.status === "COMPLETED")
      events.push({
        date: booking.checkOutDate,
        label: "Completed",
        icon: "🎉",
      });
    if (booking.status === "CANCELLED")
      events.push({ date: booking.updatedAt, label: "Cancelled", icon: "❌" });
    if (booking.status === "REFUNDED")
      events.push({ date: booking.updatedAt, label: "Refunded", icon: "💸" });
    return events;
  };

  const renderBookingCard = (booking) => {
    const host = getHost(booking.hostId);
    const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const payment =
      PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.PENDING;
    const nights = getNights(booking);
    const timeline = renderTimeline(booking);
    const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);
    const canPay =
      booking.paymentStatus === "PAY_LATER" &&
      ["CONFIRMED", "PENDING"].includes(booking.status);
    const refundPct = canCancel ? getRefundPercent(booking) : 0;
    // eslint-disable-next-line no-unused-vars
    const unusedRefundPct = refundPct; // This is calculated for future use

    return (
      <div
        className="ct-card"
        key={booking.id}
        onClick={() => navigate(`/booking/${booking.id}`)}
      >
        <div className="ct-card-header">
          <div className="ct-card-image">
            {host.hostPortfolioImages?.[0] ? (
              <img src={host.hostPortfolioImages[0]} alt="property" />
            ) : (
              <div className="ct-card-image-placeholder">🏠</div>
            )}
          </div>
          <div className="ct-card-info">
            <h3>
              {host.hostDisplayName || `${host.firstName || "Host"}'s Place`}
            </h3>
            <p className="ct-card-location">
              📍 {host.area || host.city || host.district || "N/A"},{" "}
              {host.country || ""}
            </p>
            <div className="ct-card-dates">
              <span>
                {booking.checkInDate
                  ? new Date(booking.checkInDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span className="ct-arrow">→</span>
              <span>
                {booking.checkOutDate
                  ? new Date(booking.checkOutDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span className="ct-nights">
                {nights} night{nights !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="ct-card-badges">
            <span
              className="ct-badge"
              style={{ color: status.color, background: status.bg }}
            >
              {status.icon} {status.label}
            </span>
            <span
              className="ct-badge ct-badge-payment"
              style={{ color: payment.color, background: payment.bg }}
            >
              {payment.label}
            </span>
          </div>
        </div>

        <div className="ct-card-timeline">
          {timeline.map((evt, i) => (
            <div className="ct-timeline-item" key={i}>
              <div className="ct-timeline-dot">{evt.icon}</div>
              <div className="ct-timeline-content">
                <span className="ct-timeline-label">{evt.label}</span>
                <span className="ct-timeline-date">
                  {evt.date
                    ? new Date(evt.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </div>
              {i < timeline.length - 1 && <div className="ct-timeline-line" />}
            </div>
          ))}
        </div>

        <div className="ct-card-footer">
          <div className="ct-card-price">
            <span className="ct-price-label">Total</span>
            <span className="ct-price-value">${booking.totalPrice}</span>
          </div>
          <div className="ct-card-actions" onClick={(e) => e.stopPropagation()}>
            {canPay && (
              <button
                className="ct-btn ct-btn-pay"
                onClick={() => handlePayNow(booking.id)}
              >
                💳 Pay Now
              </button>
            )}
            {canCancel && (
              <button
                className="ct-btn ct-btn-cancel"
                onClick={() => setCancelModal(booking)}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        <div className="ct-card-id">Booking #{booking.id?.substring(0, 8)}</div>

        {/* Show cancellation reason if cancelled */}
        {(booking.status === "CANCELLED" || booking.status === "REFUNDED") &&
          booking.cancellationReason && (
            <div
              style={{
                margin: "0 20px 12px",
                padding: "10px 14px",
                background: "#fff3f3",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#7f1d1d",
              }}
            >
              <strong>Cancellation reason:</strong> {booking.cancellationReason}
            </div>
          )}

        {/* Show refund info if refunded */}
        {booking.status === "REFUNDED" && booking.refundAmount && (
          <div
            style={{
              margin: "0 20px 12px",
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#14532d",
            }}
          >
            <strong>💸 Refund issued:</strong> ${booking.refundAmount}
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
              {activeTab === "current"
                ? "🏖️"
                : activeTab === "past"
                  ? "📋"
                  : "💤"}
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
              <button
                className="ct-btn ct-btn-explore"
                onClick={() => navigate("/")}
              >
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
              <p>
                <strong>Property:</strong>{" "}
                {getHost(cancelModal.hostId)?.hostDisplayName || "Host's Place"}
              </p>
              <p>
                <strong>Dates:</strong> {cancelModal.checkInDate} →{" "}
                {cancelModal.checkOutDate}
              </p>
              <p>
                <strong>Total Paid:</strong> ${cancelModal.totalPrice}
              </p>
            </div>

            <div className="ct-modal-policy">
              <h4>
                Cancellation Policy:{" "}
                {cancelModal.cancellationPolicy || "MODERATE"}
              </h4>
              <p>
                {
                  CANCELLATION_POLICIES[
                    cancelModal.cancellationPolicy || "MODERATE"
                  ]?.desc
                }
              </p>
              <div className="ct-refund-preview">
                <span>Estimated Refund:</span>
                <strong>
                  {getRefundPercent(cancelModal)}% — $
                  {Math.round(
                    ((cancelModal.totalPrice || 0) *
                      getRefundPercent(cancelModal)) /
                      100,
                  )}
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
              <button
                className="ct-btn ct-btn-secondary"
                onClick={() => setCancelModal(null)}
              >
                Keep Booking
              </button>
              <button
                className="ct-btn ct-btn-danger"
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
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
