import axiosInstance from "./axiosInstance.js"


export const registerUser =(data) => {
  axiosInstance.post("/users/register",data)
}

export const verifyOTP = (data) =>{
  axiosInstance.post("/users/verify-otp",data)
}

export const loginUser = (data) =>{
  axiosInstance.post("/users/login",data)
}

export const logoutUser = ()=>{
  axiosInstance.post("/users/logout")
}

export const refreshUser = ()=>{
  axiosInstance.get("/users/refresh-token")
}