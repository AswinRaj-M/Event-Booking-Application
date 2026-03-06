import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminVendorManagement from '../pages/admin/AdminVendorManagement.jsx'
import AdminVendorApplicationView from '../pages/admin/AdminVendorApplicationView.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin/>}/>
      <Route path='/dashboard' element={<AdminDashboard/>}/>
      <Route path='/vendorManagement'  element={<AdminVendorManagement/>}/>
      <Route path="/vendor-application" element={<AdminVendorApplicationView/>}/>
    </Routes>
  )
}

export default AdminRoutes