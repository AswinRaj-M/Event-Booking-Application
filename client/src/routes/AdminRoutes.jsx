import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminPannel from '../pages/admin/AdminPannel.jsx'

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin/>}/>
      <Route path='/pannel' element={<AdminPannel/>}/>
    </Routes>
  )
}

export default AdminRoutes