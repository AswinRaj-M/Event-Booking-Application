import axiosInstance from "./axiosInstance.js"


export const registerUser =(data) => {
 return axiosInstance.post("/users/register",data)
}

export const verifyOTP = (data) =>{
  return axiosInstance.post("/users/verify-otp",data)
}

export const resendOtp = (userId) =>{
  return axiosInstance.post("/users/resend-otp",{userId})
}

export const loginUser = (data) =>{
  return axiosInstance.post("/users/login",data)
}

export const forgotPassword = (email) =>{
  return axiosInstance.post("/users/forgot-password",{email})
}

export const resetPassword = (resetToken,password) =>{
  return axiosInstance.patch("/users/reset-password",{resetToken,password})
}

export const logoutUser = ()=>{
  return axiosInstance.post("/users/logout")
}

export const refreshUser = ()=>{
  return axiosInstance.get("/users/refresh-token")
}