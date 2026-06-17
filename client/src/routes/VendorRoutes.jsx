import React from 'react'
import { Routes, Route } from 'react-router-dom'
import VendorApplication from '../pages/vendor/VendorApplication'
import VendorStatus from '../pages/vendor/VendorStatus'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import VendorProfilePage from "../pages/vendor/VendorProfilePage.jsx"
import VendorCreateEvent from "../pages/vendor/VendorCreateEvent.jsx"
import VendorMyEvent from "../pages/vendor/VendorMyEvent.jsx"
import VendorDraft from "../pages/vendor/VendorDraft.jsx"
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
      <Route path="profile" element={
        <ProtectedRoute role="vendor">
          <VendorProfilePage />
        </ProtectedRoute>
      } />
      <Route path="create-event" element={
        <ProtectedRoute role="vendor">
          <VendorCreateEvent />
        </ProtectedRoute>
      } />
      <Route path="events" element={
        <ProtectedRoute role="vendor">
          <VendorMyEvent />
        </ProtectedRoute>
      } />
      <Route path="events/drafts" element={
        <ProtectedRoute role="vendor">
          <VendorDraft />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default VendorRoutes