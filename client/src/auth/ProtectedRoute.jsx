import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"
import { ROUTES } from "../constants/routes"

export const ProtectedRoute = ({ children, role = "user" }) => {
  const location = useLocation()
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)
  const userAuthChecked = useSelector((state) => state.user?.authChecked)
  const vendorAuthChecked = useSelector((state) => state.vendor?.authChecked)
  const adminAuthChecked = useSelector((state) => state.admin?.authChecked)

  // Show nothing or a loader while the initial auth check is in progress
  if (role === "admin" && !adminAuthChecked) return null;
  if (role === "vendor" && !vendorAuthChecked) return null;
  if (role === "user" && !userAuthChecked) return null;

  if (role === "admin" && !admin) return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  if (role === "vendor" && !vendor) return <Navigate to={ROUTES.LOGIN} replace />
  if (role === "user" && !user) return <Navigate to={ROUTES.LOGIN} replace />

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

  const isRootAdmin = location.pathname.startsWith(ROUTES.ADMIN_ROOT);
  const isRootVendor = location.pathname.startsWith(ROUTES.VENDOR_ROOT);

  if (isRootAdmin && !adminAuthChecked) return null;
  if (isRootVendor && !vendorAuthChecked) return null;
  if (!isRootAdmin && !isRootVendor && !userAuthChecked) return null;

  if (admin) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
  } else if (vendor) {
    if (vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") {
      return <Navigate to={ROUTES.VENDOR_STATUS} replace />
    }
    return <Navigate to={ROUTES.VENDOR_DASHBOARD} replace />
  } else if (user) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}