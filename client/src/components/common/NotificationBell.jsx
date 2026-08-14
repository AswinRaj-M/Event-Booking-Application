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
  Ticket
} from "lucide-react";

const NotificationBell = () => {
  const { user } = useSelector((state) => state.user);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("festivo_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const savedUnread = localStorage.getItem("festivo_unread_notifications");
      return savedUnread ? parseInt(savedUnread, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Listen to custom window event dispatched globally on new notifications
  useEffect(() => {
    const handleNotificationEvent = (e) => {
      const notif = e.detail;
      if (!notif) return;

      const newNotif = {
        _id: notif._id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
        title: notif.title || "Notification",
        message: notif.message || "",
        type: notif.type || "INFO",
        createdAt: notif.createdAt || new Date().toISOString(),
      };

      setNotifications((prev) => {
        if (prev.some((n) => n._id === newNotif._id)) return prev;
        const updated = [newNotif, ...prev].slice(0, 30);
        return updated;
      });

      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("festivo:notification", handleNotificationEvent);

    return () => {
      window.removeEventListener("festivo:notification", handleNotificationEvent);
    };
  }, []);

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
      if (!prev) {
        setUnreadCount(0);
        try {
          localStorage.setItem("festivo_unread_notifications", "0");
        } catch (e) {}
      }
      return !prev;
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      localStorage.removeItem("festivo_notifications");
      localStorage.setItem("festivo_unread_notifications", "0");
    } catch (e) {}
  };

  const handleRemoveNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n._id !== id);
      try {
        localStorage.setItem("festivo_notifications", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Bell className="w-4 h-4 text-purple-400" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={toggleNotifications}
        aria-label="Notifications"
        className="relative text-[#8A8F98] hover:text-white transition-colors outline-none cursor-pointer p-2 rounded-xl hover:bg-white/5 flex items-center justify-center"
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0E0B1F]/98 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <p className="text-xs text-zinc-500 mt-1">We'll alert you here when there are updates on your bookings</p>
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
