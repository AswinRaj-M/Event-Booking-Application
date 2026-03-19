import { useSelector } from "react-redux"
import { Navigate, useLocation } from "react-router-dom"

export const ProtectedRoute = ({ children, role = "user" }) => {
  const location = useLocation()
  const user = useSelector((state) => state.user?.user)
  const vendor = useSelector((state) => state.vendor?.vendor)
  const admin = useSelector((state) => state.admin?.admin)


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

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />
  } else if (vendor) {
    if (vendor.applicationStatus === "pending" || vendor.applicationStatus === "rejected") {
      return <Navigate to="/vendor/status" replace />
    }
    return <Navigate to="/vendor/dashboard" replace />
  } else if (user) {
    return <Navigate to="/home" replace />
  }

  return children
}