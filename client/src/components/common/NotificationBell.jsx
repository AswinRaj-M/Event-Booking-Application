import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Bell,
  X,
  Trash2,
  CheckCircle2,
  CreditCard,
  XCircle,
  Clock,
  Wallet,
  AlertTriangle,
  Ticket,
  Flame,
  UserCheck
} from "lucide-react";
import {
  getUserNotificationsApi,
  markUserNotificationsReadApi,
  deleteUserNotificationApi,
  clearAllUserNotificationsApi
} from "../../services/user.api";
import {
  getAdminNotificationsApi,
  markAdminNotificationsReadApi,
  deleteAdminNotificationApi,
  clearAllAdminNotificationsApi
} from "../../services/admin.api";

const NotificationBell = ({ placement = "right", className = "" }) => {
  const { user } = useSelector((state) => state.user || {});
  const { vendor } = useSelector((state) => state.vendor || {});
  const { admin } = useSelector((state) => state.admin || {});
  const activeUserId = user?.id || user?._id || vendor?.id || vendor?._id || admin?.id || admin?._id || null;
  const isAdmin = Boolean(admin?.id || admin?._id);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user-owned notifications from DB & user-scoped storage when activeUserId changes
  useEffect(() => {
    if (!activeUserId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // 1. Initial read from user-scoped storage
    try {
      const saved = localStorage.getItem(`festivo_notifications_${activeUserId}`);
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
      const savedUnread = localStorage.getItem(`festivo_unread_notifications_${activeUserId}`);
      if (savedUnread) {
        setUnreadCount(parseInt(savedUnread, 10));
      }
    } catch (e) {}

    // 2. Fetch fresh user-owned notifications from backend DB
    let isMounted = true;
    const fetchApi = isAdmin ? getAdminNotificationsApi : getUserNotificationsApi;
    fetchApi()
      .then((res) => {
        if (!isMounted || !res.data?.success) return;
        const fetchedNotifs = Array.isArray(res.data.notifications) ? res.data.notifications : [];
        const count = typeof res.data.unreadCount === "number" ? res.data.unreadCount : 0;
        setNotifications(fetchedNotifs);
        setUnreadCount(count);
        try {
          localStorage.setItem(`festivo_notifications_${activeUserId}`, JSON.stringify(fetchedNotifs));
          localStorage.setItem(`festivo_unread_notifications_${activeUserId}`, count.toString());
        } catch (e) {}
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeUserId, isAdmin]);

  // Listen to custom window event dispatched globally on new real-time notifications
  useEffect(() => {
    const handleNotificationEvent = (e) => {
      const notif = e.detail;
      if (!notif || !activeUserId) return;

      // Verify recipient ownership if userId is attached
      if (notif.userId && notif.userId.toString() !== activeUserId.toString()) {
        return;
      }

      const newNotif = {
        _id: notif._id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
        userId: activeUserId,
        title: notif.title || "Notification",
        message: notif.message || "",
        type: notif.type || "INFO",
        isRead: false,
        createdAt: notif.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        const updated = [newNotif, ...prev].slice(0, 50);
        try {
          localStorage.setItem(`festivo_notifications_${activeUserId}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setUnreadCount((prev) => {
        const newCount = prev + 1;
        try {
          localStorage.setItem(`festivo_unread_notifications_${activeUserId}`, newCount.toString());
        } catch (e) {}
        return newCount;
      });
    };

    window.addEventListener("festivo:notification", handleNotificationEvent);

    return () => {
      window.removeEventListener("festivo:notification", handleNotificationEvent);
    };
  }, [activeUserId]);

  // Close notification dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => {
      const willOpen = !prev;
      if (willOpen && unreadCount > 0) {
        setUnreadCount(0);
        if (activeUserId) {
          try {
            localStorage.setItem(`festivo_unread_notifications_${activeUserId}`, "0");
          } catch (e) {}
        }
        const markReadApi = isAdmin ? markAdminNotificationsReadApi : markUserNotificationsReadApi;
        markReadApi().catch(() => {});
      }
      return willOpen;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (activeUserId) {
      try {
        localStorage.removeItem(`festivo_notifications_${activeUserId}`);
        localStorage.setItem(`festivo_unread_notifications_${activeUserId}`, "0");
      } catch (e) {}
    }
    const clearApi = isAdmin ? clearAllAdminNotificationsApi : clearAllUserNotificationsApi;
    clearApi().catch(() => {});
  };

  const handleRemoveNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n._id !== id);
      if (activeUserId) {
        try {
          localStorage.setItem(`festivo_notifications_${activeUserId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    const deleteApi = isAdmin ? deleteAdminNotificationApi : deleteUserNotificationApi;
    deleteApi(id).catch(() => {});
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "BOOKING_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Ticket className="w-4 h-4 text-purple-400" />
          </div>
        );
      case "PAYMENT_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case "BOOKING_CANCELLED":
        return (
          <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
        );
      case "REFUND_REQUESTED":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        );
      case "REFUND_COMPLETED":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
        );
      case "EVENT_CANCELLED":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
        );
      case "TICKET_CHECKED_IN":
        return (
          <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
        );
      case "NEW_BOOKING":
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
        );
      case "EVENT_SOLD_OUT":
        return (
          <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Bell className="w-4 h-4 text-purple-400" />
          </div>
        );
    }
  };

  // Compute responsive dropdown position classes
  const getDropdownClasses = () => {
    if (placement === "sidebar") {
      return "fixed top-16 left-4 right-4 sm:absolute sm:top-0 sm:left-full sm:right-auto sm:ml-4 w-auto sm:w-96 max-w-sm z-[999]";
    }
    if (placement === "left") {
      return "fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-0 sm:right-auto sm:mt-3 w-auto sm:w-96 max-w-sm z-[999]";
    }
    // default: "right"
    return "fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-3 w-auto sm:w-96 max-w-sm z-[999]";
  };

  return (
    <div className={`relative shrink-0 ${className}`} ref={notificationRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={toggleNotifications}
        aria-label="Notifications"
        className="relative text-[#8A8F98] hover:text-white transition-colors outline-none cursor-pointer p-2 rounded-xl hover:bg-white/5 flex items-center justify-center shrink-0"
      >
        <Bell className="w-5 h-5" fill={unreadCount > 0 ? "currentColor" : "none"} />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#ff3366] text-white text-[10px] font-black rounded-full border border-black flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : notifications.length > 0 ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border border-black"></span>
        ) : null}
      </button>

      {/* Notification Dropdown Menu */}
      {isNotificationOpen && (
        <div className={`${getDropdownClasses()} bg-[#0E0B1F]/98 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
          {/* Header */}
          <div className="p-4 px-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-white tracking-wide">Notifications</h4>
              {notifications.length > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearNotifications}
                className="text-xs text-zinc-400 hover:text-red-400 transition-colors font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                  <Bell className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-sm font-semibold text-white">No notifications yet</p>
                <p className="text-xs text-zinc-500 mt-1">We'll alert you here when there are new bookings or event updates</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.createdAt}
                  className="p-4 hover:bg-white/[0.04] transition-colors relative group flex gap-3 items-start"
                >
                  {renderNotificationIcon(notif.type)}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs font-bold text-white truncate">{notif.title}</h5>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Just now"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed break-words">{notif.message}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNotification(notif._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity p-1 rounded hover:bg-white/5 cursor-pointer absolute top-3 right-3"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
