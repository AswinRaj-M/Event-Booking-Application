import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminVendorManagement from '../pages/admin/AdminVendorManagement.jsx'
import AdminVendorApplicationView from '../pages/admin/AdminVendorApplicationView.jsx'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx'
import { ROUTES } from '../constants/routes'

function AdminRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.ADMIN_LOGIN_PATH} element={
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      } />
      <Route path={ROUTES.ADMIN_DASHBOARD_PATH} element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_VENDORS_PATH} element={
        <ProtectedRoute role="admin">
          <AdminVendorManagement />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_VENDOR_VIEW_PATH} element={
        <ProtectedRoute role="admin">
          <AdminVendorApplicationView />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AdminRoutes