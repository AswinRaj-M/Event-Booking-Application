import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import { Toaster, toast } from "sonner";
import { Routes, Route } from 'react-router-dom';
import GlobalSmoothScroll from './components/common/GlobalSmoothScroll';

import { useSelector } from 'react-redux';
import { getSocket, disconnectSocket } from './services/socket';

function App() {
  const { user } = useSelector((state) => state.user);
  const { vendor } = useSelector((state) => state.vendor);

  useEffect(() => {
    const suspendedMessage = localStorage.getItem("userSuspendedToast");
    if (suspendedMessage) {
      toast.error(suspendedMessage);
      localStorage.removeItem("userSuspendedToast");
    }
  }, []);

  useEffect(() => {
    const activeId = user?.id || user?._id || vendor?.id || vendor?._id;
    if (!activeId) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(activeId);

    const handleNotification = (data) => {
      if (!data) return;

      // Verify recipient ownership if target userId is attached
      if (data.userId && data.userId.toString() !== activeId.toString()) {
        return;
      }

      const newNotif = {
        _id: data._id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
        userId: activeId,
        title: data.title || "Notification",
        message: data.message || "",
        type: data.type || "INFO",
        createdAt: data.createdAt || new Date().toISOString(),
      };

      try {
        const notifKey = `festivo_notifications_${activeId}`;
        const unreadKey = `festivo_unread_notifications_${activeId}`;
        const saved = localStorage.getItem(notifKey);
        const list = saved ? JSON.parse(saved) : [];
        if (!list.some((n) => n._id === newNotif._id)) {
          const updated = [newNotif, ...list].slice(0, 50);
          localStorage.setItem(notifKey, JSON.stringify(updated));
        }

        const unread = parseInt(localStorage.getItem(unreadKey) || "0", 10);
        localStorage.setItem(unreadKey, (unread + 1).toString());
      } catch (e) {
        console.error("Failed to persist notification:", e);
      }

      // Display single real-time toast at top-right deduplicated by unique ID
      toast(newNotif.title, {
        id: newNotif._id,
        description: newNotif.message,
        icon: "🔔",
      });

      // Dispatch event to update all mounted notification bells
      window.dispatchEvent(new CustomEvent("festivo:notification", { detail: newNotif }));
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [user, vendor]);

  return (
    <>
      <GlobalSmoothScroll />
      <Toaster 
        position="top-right" 
        theme="dark"
        closeButton
        toastOptions={{
          style: {
            background: "#0E0B1F",
            border: "1px solid #6d28d9",
            color: "#ffffff",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
          }
        }}
      />
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes/>}/>
      <Route path='/vendor/*' element={<VendorRoutes/>}/>
      <Route path="/*" element={<AppRoutes />}/>
    </Routes>
    </>
  );
}

export default App;
