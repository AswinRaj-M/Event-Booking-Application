import React from 'react'
import VendorApplication from '../pages/vendor/VendorApplication'
import { Routes,Route } from 'react-router-dom'

function VendorRoutes() {
  return (
    <Routes>
      <Route path="application" element={<VendorApplication/>}/>
    </Routes>
  )
}

export default VendorRoutes