import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/vendorRoutes';
import { Toaster, toast } from "sonner";
import { Routes, Route } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { getSocket, disconnectSocket } from './services/socket';

function App() {
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const suspendedMessage = localStorage.getItem("userSuspendedToast");
    if (suspendedMessage) {
      toast.error(suspendedMessage);
      localStorage.removeItem("userSuspendedToast");
    }
  }, []);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (!userId) {
      disconnectSocket();
      return;
    }

    const socket = getSocket(userId);

    const handleNotification = (data) => {
      if (!data) return;

      const newNotif = {
        _id: data._id || Date.now().toString() + Math.random().toString(36).substring(2, 6),
        title: data.title || "Notification",
        message: data.message || "",
        type: data.type || "INFO",
        createdAt: data.createdAt || new Date().toISOString(),
      };

      try {
        const saved = localStorage.getItem("festivo_notifications");
        const list = saved ? JSON.parse(saved) : [];
        if (!list.some((n) => n._id === newNotif._id)) {
          const updated = [newNotif, ...list].slice(0, 30);
          localStorage.setItem("festivo_notifications", JSON.stringify(updated));
        }

        const unread = parseInt(localStorage.getItem("festivo_unread_notifications") || "0", 10);
        localStorage.setItem("festivo_unread_notifications", (unread + 1).toString());
      } catch (e) {
        console.error("Failed to persist notification:", e);
      }

      // Display real-time toast at top-right
      toast(newNotif.title, {
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
  }, [user]);

  return (
    <>
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
      <Route path="/*" element={<AppRoutes />}/>
      <Route path="/admin/*" element={<AdminRoutes/>}/>
      <Route path='/vendor/*' element={<VendorRoutes/>}/>
    </Routes>
    </>
  );
}

export default App;
