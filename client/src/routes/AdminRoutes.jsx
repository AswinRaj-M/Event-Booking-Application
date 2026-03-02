import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin/>}/>
      <Route path='/dashboard' element={<AdminDashboard/>}/>
    </Routes>
  )
}

export default AdminRoutes