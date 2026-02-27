import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUserThunk } from '../features/user.slice'

function home() {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async()=>{
    await dispatch(logoutUserThunk())
    navigate('/login')
  }
  return (
    <>
      <div>home</div>
      <button onClick={handleLogout} >logout</button>
    </>
    
  )
}

export default home