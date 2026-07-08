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
import { VENDOR_ROUTES } from '../constants/Routes'

function VendorRoutes() {
  return (
    <Routes>

      <Route path={VENDOR_ROUTES.APPLICATION.replace('/vendor/', '')} element={<VendorApplication />} />
      <Route path={VENDOR_ROUTES.STATUS.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorStatus />
        </ProtectedRoute>
      } />
      <Route path={VENDOR_ROUTES.DASHBOARD.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path={VENDOR_ROUTES.PROFILE.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorProfilePage />
        </ProtectedRoute>
      } />
      <Route path={VENDOR_ROUTES.CREATE_EVENT.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorCreateEvent />
        </ProtectedRoute>
      } />
      <Route path={VENDOR_ROUTES.EVENTS.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorMyEvent />
        </ProtectedRoute>
      } />
      <Route path={VENDOR_ROUTES.DRAFTS.replace('/vendor/', '')} element={
        <ProtectedRoute role="vendor">
          <VendorDraft />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default VendorRoutes