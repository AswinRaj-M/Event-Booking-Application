import axiosInstance from "./axiosInstance.js"


export const registerUser =(data) => {
 return axiosInstance.post("/users/register",data)
}

export const verifyOTP = (data) =>{
  return axiosInstance.post("/users/verify-otp",data)
}

export const loginUser = (data) =>{
  return axiosInstance.post("/users/login",data)
}

export const logoutUser = ()=>{
  return axiosInstance.post("/users/logout")
}

export const refreshUser = ()=>{
  return axiosInstance.get("/users/refresh-token")
}