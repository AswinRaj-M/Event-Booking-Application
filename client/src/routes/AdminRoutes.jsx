import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminVendorManagement from '../pages/admin/AdminVendorManagement.jsx'
import AdminVendorApplicationView from '../pages/admin/AdminVendorApplicationView.jsx'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx'
import AdminCategoryManagement from '../pages/admin/AdminCategoryManagement.jsx'
import AdminUsersManagement from '../pages/admin/AdminUsersManagement.jsx'
import AdminEventManagement from '../pages/admin/AdminEventManagement.jsx'
import { ADMIN_ROUTES } from '../constants/Routes'

function AdminRoutes() {
  return (
    <Routes>
      <Route path={ADMIN_ROUTES.LOGIN.replace('/admin', '')} element={
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      } />
      <Route path={ADMIN_ROUTES.DASHBOARD.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path={ADMIN_ROUTES.VENDORS.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminVendorManagement />
        </ProtectedRoute>
      } />
      <Route path={ADMIN_ROUTES.USERS.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminUsersManagement />
        </ProtectedRoute>
      } />
      <Route path={ADMIN_ROUTES.CATEGORIES.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminCategoryManagement/>
        </ProtectedRoute>
      } />
      <Route path={ADMIN_ROUTES.VENDOR_APPLICATION.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminVendorApplicationView />
        </ProtectedRoute>
      } />
      <Route path={ADMIN_ROUTES.EVENTS.replace('/admin', '')} element={
        <ProtectedRoute role="admin">
          <AdminEventManagement />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AdminRoutes