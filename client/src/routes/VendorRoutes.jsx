import React from 'react'
import { Routes, Route } from 'react-router-dom'
import VendorApplication from '../pages/vendor/VendorApplication'
import VendorStatus from '../pages/vendor/VendorStatus'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import { ProtectedRoute, PublicRoute } from '../auth/ProtectedRoute.jsx'
import { ROUTES } from '../constants/routes'

function VendorRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.VENDOR_APPLICATION_PATH} element={
        <PublicRoute>
          <VendorApplication />
        </PublicRoute>
      } />
      <Route path={ROUTES.VENDOR_STATUS_PATH} element={
        <ProtectedRoute role="vendor">
          <VendorStatus />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.VENDOR_DASHBOARD_PATH} element={
        <ProtectedRoute role="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default VendorRoutes