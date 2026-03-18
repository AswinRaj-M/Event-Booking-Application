import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminVendorManagement from '../pages/admin/AdminVendorManagement.jsx'
import AdminVendorApplicationView from '../pages/admin/AdminVendorApplicationView.jsx'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <AdminLogin />
        </PublicRoute>
      } />
      <Route path='/dashboard' element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path='/vendors' element={
        <ProtectedRoute role="admin">
          <AdminVendorManagement />
        </ProtectedRoute>
      } />
      <Route path="/vendor-application/:id" element={
        <ProtectedRoute role="admin">
          <AdminVendorApplicationView />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AdminRoutes