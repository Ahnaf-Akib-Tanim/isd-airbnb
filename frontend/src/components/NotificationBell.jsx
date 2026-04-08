import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import notificationService from "../services/notificationService";

const POLL_INTERVAL_MS = 15000;

const parseBackendDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const normalizedValue =
    typeof value === "string" && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value}Z`
      : value;

  const date = new Date(normalizedValue);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = parseBackendDate(value);
  if (!date) return "";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const isUnread = (notification) => !notification.readAt && notification.status === "UNREAD";

const NotificationBell = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const panelRef = useRef(null);
  const initializedRef = useRef(false);
  const unreadIdsRef = useRef(new Set());

  const loadNotifications = useCallback(
    async ({ silent = false } = {}) => {
      if (!user?.userId) return;

      if (!silent) {
        setLoading(true);
      }

      try {
        const data =
          user.role === "ADMIN"
            ? await notificationService.getRoleNotifications("ADMIN")
            : await notificationService.getUserNotifications(user.userId);

        const normalized = (data || []).sort(
          (left, right) =>
            (parseBackendDate(right.createdAt)?.getTime() || 0) -
            (parseBackendDate(left.createdAt)?.getTime() || 0),
        );

        const nextUnreadIds = new Set(
          normalized.filter(isUnread).map((item) => item.notificationId),
        );

        if (initializedRef.current) {
          const previousUnreadIds = unreadIdsRef.current;
          const hasNewUnread = normalized.some(
            (item) =>
              nextUnreadIds.has(item.notificationId) &&
              !previousUnreadIds.has(item.notificationId),
          );

          if (hasNewUnread) {
            setPulse(true);
            window.setTimeout(() => setPulse(false), 2200);
          }
        } else {
          initializedRef.current = true;
        }

        unreadIdsRef.current = nextUnreadIds;
        setNotifications(normalized);
      } catch (error) {
        if (!silent) {
          console.error(
            error.response?.data?.error || "Failed to load notifications.",
          );
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [user?.role, user?.userId],
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user?.userId) return undefined;

    const intervalId = window.setInterval(() => {
      loadNotifications({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications, user?.userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
        setExpandedId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    // Toggle expand
    setExpandedId(expandedId === notification.notificationId ? null : notification.notificationId);

    // Only mark read if it was unread
    if (isUnread(notification)) {
      notificationService
        .markNotificationAsRead(notification.notificationId)
        .catch(() => {});

      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notification.notificationId
            ? {
                ...item,
                readAt: new Date().toISOString(),
                status: "READ",
              }
            : item,
        ),
      );
      unreadIdsRef.current.delete(notification.notificationId);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(isUnread);
    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach((item) => {
      notificationService
        .markNotificationAsRead(item.notificationId)
        .catch(() => {});
    });

    setNotifications((prev) =>
      prev.map((item) =>
        isUnread(item)
          ? {
              ...item,
              readAt: new Date().toISOString(),
              status: "READ",
            }
          : item,
      ),
    );
    unreadIdsRef.current.clear();
  };

  const unreadCount = useMemo(
    () => notifications.filter(isUnread).length,
    [notifications],
  );

  return (
    <div className="navbar__notification" ref={panelRef}>
      <button
        type="button"
        className={`navbar__icon-btn navbar__notification-btn ${pulse ? "navbar__notification-btn--pulse" : ""}`}
        aria-label="Notifications"
        onClick={() => {
          setOpen((prev) => !prev);
          if (open) setExpandedId(null);
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          aria-hidden="true" 
          style={{ width: '26px', height: '26px', color: '#FF385C', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' }}
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="navbar__notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="navbar__notification-panel animate-fade-in" style={{ width: 360 }}>
          <div className="navbar__notification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Notifications</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{ background: 'none', border: 'none', color: '#ff385c', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: '4px 8px', fontSize: '13px' }}
                onClick={() => loadNotifications()}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="navbar__notification-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            {loading ? (
              <div className="navbar__notification-empty">
                <span className="spinner spinner-dark" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="navbar__notification-empty">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 15).map((notification) => {
                const unread = isUnread(notification);
                const isExpanded = expandedId === notification.notificationId;
                
                return (
                  <article
                    key={notification.notificationId}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #ebebeb',
                      cursor: 'pointer',
                      background: unread ? '#f0f7ff' : '#ffffff',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = unread ? '#e6f3ff' : '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = unread ? '#f0f7ff' : '#ffffff'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {unread && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff385c', flexShrink: 0 }} />
                        )}
                        <strong style={{ fontSize: '14px', color: '#222', fontWeight: unread ? 600 : 500 }}>
                          {notification.title || "New Update"}
                        </strong>
                      </div>
                      <span style={{ fontSize: '12px', color: '#717171', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    
                    <p style={{ 
                      margin: '6px 0 0 0', 
                      fontSize: '14px', 
                      color: unread ? '#484848' : '#717171',
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </p>

                    {isExpanded && (
                      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f0f0f0', color: '#484848', borderRadius: '4px', fontWeight: 600 }}>
                          {notification.type?.replaceAll("_", " ") || "PROFILE"}
                        </span>
                        {notification.resolutionNote && (
                          <span style={{ fontSize: '11px', padding: '2px 8px', background: '#fff0f3', color: '#e51c44', borderRadius: '4px' }}>
                            {notification.resolutionNote}
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
