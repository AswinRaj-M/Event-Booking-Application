import { useEffect } from "react"
import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { checkVendorStatus } from "../services/vendor.api"
import { COMMON_ROUTES, USER_ROUTES, VENDOR_ROUTES, ADMIN_ROUTES } from "../constants/Routes"

export const ProtectedRoute = ({ children, role = "user" }) => {
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const location = useLocation()

  useEffect(() => {
    if (role === "vendor" && vendor) {
      const poll = async () => {
        try {
          await checkVendorStatus();
        } catch (error) {
          console.error("[Vendor Poller] Polling status check failed:", error);
        }
      };


      poll();

      const interval = setInterval(poll, 30000);
      return () => clearInterval(interval);
    }
  }, [role, vendor]);

  if (role === "admin" && !admin) return <Navigate to={ADMIN_ROUTES.LOGIN} replace />
  if (role === "vendor" && !vendor) return <Navigate to={COMMON_ROUTES.LOGIN} replace />
  if (role === "user" && !user) return <Navigate to={COMMON_ROUTES.LOGIN} replace />

  if (role === "vendor" && vendor) {
    const isStatusPage = location.pathname.includes(VENDOR_ROUTES.STATUS);
    if ((vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") && !isStatusPage) {
       return <Navigate to={VENDOR_ROUTES.STATUS} replace />
    } else if (vendor.applicationStatus === "approved" && isStatusPage) {
       return <Navigate to={VENDOR_ROUTES.DASHBOARD} replace />
    }
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const location = useLocation()

  if (location.state?.isEmailUpdate) {
    return children
  }

  // Allow access to forgot and reset password pages even if logged in
  const isPasswordPage = location.pathname.startsWith(COMMON_ROUTES.FORGOT_PASSWORD) || location.pathname.startsWith(COMMON_ROUTES.RESET_PASSWORD.split('/:')[0]);
  if (isPasswordPage) {
    return children
  }

  if (admin && location.pathname.startsWith("/admin")) {
    return <Navigate to={ADMIN_ROUTES.DASHBOARD} replace />
  } else if (vendor) {
    if (vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") {
      return <Navigate to={VENDOR_ROUTES.STATUS} replace />
    }
    return <Navigate to={VENDOR_ROUTES.DASHBOARD} replace />
  } else if (user) {
    return <Navigate to={USER_ROUTES.HOME} replace />
  }

  return children
}