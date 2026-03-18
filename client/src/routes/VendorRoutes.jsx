import React from 'react'
import { Routes, Route } from 'react-router-dom'
import VendorApplication from '../pages/vendor/VendorApplication'
import VendorStatus from '../pages/vendor/VendorStatus'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import { ProtectedRoute } from '../auth/ProtectedRoute.jsx'

function VendorRoutes() {
  return (
    <Routes>

      <Route path="application" element={<VendorApplication />} />
      <Route path='status' element={
        <ProtectedRoute role="vendor">
          <VendorStatus />
        </ProtectedRoute>
      } />
      <Route path="dashboard" element={
        <ProtectedRoute role="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default VendorRoutes