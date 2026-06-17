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
      <Route path="/users" element={
        <ProtectedRoute role="admin">
          <AdminUsersManagement />
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute role="admin">
          <AdminCategoryManagement/>
        </ProtectedRoute>
      } />
      <Route path="/vendor-application/:id" element={
        <ProtectedRoute role="admin">
          <AdminVendorApplicationView />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute role="admin">
          <AdminEventManagement />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AdminRoutes