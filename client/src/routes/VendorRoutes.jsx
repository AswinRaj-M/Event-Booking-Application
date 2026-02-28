import React from 'react'
import { Routes,Route } from 'react-router-dom'
import VendorApplication from '../pages/vendor/VendorApplication'
import VendorStatus from '../pages/vendor/VendorStatus'

function VendorRoutes() {
  return (
    <Routes>
      <Route path="application" element={<VendorApplication/>}/>
      <Route path='status' element={<VendorStatus/>}/>
    </Routes>
  )
}

export default VendorRoutes