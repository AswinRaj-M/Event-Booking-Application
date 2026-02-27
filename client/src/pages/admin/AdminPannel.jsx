import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutAdminState } from '../../features/admin.slice'

function AdminPannel() {

    const dispatch = useDispatch()
    const navigate = useNavigate()


  const handleLogout = ()=>{
    dispatch(logoutAdminState())
    navigate("/admin/login")
  }
  return (
    <>
      <h2>Admin Pannel</h2>
      <button onClick={handleLogout}>logout admin</button>
    </>
  )
}

export default AdminPannel