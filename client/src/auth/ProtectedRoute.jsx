import { useEffect } from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { checkVendorStatus } from "../services/vendor.api"

export const ProtectedRoute = ({ children, role = "user" }) => {
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)

  useEffect(() => {
    if (role === "vendor" && vendor) {
      const poll = async () => {
        try {
          await checkVendorStatus();
        } catch (error) {
          console.error("[Vendor Poller] Polling status check failed:", error);
        }
      };

      // Initial check
      poll();

      const interval = setInterval(poll, 30000);
      return () => clearInterval(interval);
    }
  }, [role, vendor]);

  if (role === "admin" && !admin) return <Navigate to="/admin/login" replace />
  if (role === "vendor" && !vendor) return <Navigate to="/login" replace />
  if (role === "user" && !user) return <Navigate to="/login" replace />

  if (role === "vendor" && vendor) {
    const isStatusPage = location.pathname.includes("/vendor/status");
    if ((vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") && !isStatusPage) {
       return <Navigate to="/vendor/status" replace />
    } else if (vendor.applicationStatus === "approved" && isStatusPage) {
       return <Navigate to="/vendor/dashboard" replace />
    }
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const location = useLocation()

  if (admin && location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/dashboard" replace />
  } else if (vendor) {
    if (vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") {
      return <Navigate to="/vendor/status" replace />
    }
    return <Navigate to="/vendor/dashboard" replace />
  } else if (user) {
    return <Navigate to="/user/home" replace />
  }

  return children
}