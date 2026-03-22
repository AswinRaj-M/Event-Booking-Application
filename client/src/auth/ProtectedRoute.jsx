import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { ROUTES } from "../constants/routes"
import Loader from "../components/common/Loader"

export const ProtectedRoute = ({ children, role = "user" }) => {
  const location = useLocation()
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const userAuthChecked = useSelector((state) => state.user?.authChecked)
  const vendorAuthChecked = useSelector((state) => state.vendor?.authChecked)
  const adminAuthChecked = useSelector((state) => state.admin?.authChecked)

  // Show a loader while the initial auth check is in progress
  if (role === "admin" && !adminAuthChecked) return <Loader />;
  if (role === "vendor" && !vendorAuthChecked) return <Loader />;
  if (role === "user" && !userAuthChecked) return <Loader />;

  // Redirect to correct login or dashboard if unauthorized
  if (role === "admin" && !admin) {
    if (vendor) return <Navigate to={ROUTES.VENDOR_DASHBOARD} replace />;
    if (user) return <Navigate to={ROUTES.HOME} replace />;
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }
  if (role === "vendor" && !vendor) {
    if (admin) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (user) return <Navigate to={ROUTES.HOME} replace />;
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  if (role === "user" && !user) {
    if (admin) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (vendor) return <Navigate to={ROUTES.VENDOR_DASHBOARD} replace />;
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (role === "vendor" && vendor) {
    const isStatusPage = location.pathname.includes(ROUTES.VENDOR_STATUS);
    if ((vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") && !isStatusPage) {
      return <Navigate to={ROUTES.VENDOR_STATUS} replace />
    } else if (vendor.applicationStatus === "approved" && isStatusPage) {
      return <Navigate to={ROUTES.VENDOR_DASHBOARD} replace />
    }
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const userAuthChecked = useSelector((state) => state.user?.authChecked)
  const vendorAuthChecked = useSelector((state) => state.vendor?.authChecked)
  const adminAuthChecked = useSelector((state) => state.admin?.authChecked)
  const location = useLocation()

  // Wait for ALL auth checks before making public routing decisions
  if (!userAuthChecked || !vendorAuthChecked || !adminAuthChecked) return <Loader />;

  // Cross-role protection: if any role is logged in, redirect them to their home base
  if (admin) return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  
  if (vendor) {
    if (vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") {
      return <Navigate to={ROUTES.VENDOR_STATUS} replace />;
    }
    return <Navigate to={ROUTES.VENDOR_DASHBOARD} replace />;
  }

  if (user) return <Navigate to={ROUTES.HOME} replace />;

  return children;
};