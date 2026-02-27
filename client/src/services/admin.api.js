import axiosInstance from "./axiosInstance";


export const adminLogin = (data)=>{
  return axiosInstance.post("/admin/login",data)
}

export const logoutAdmin = (data) =>{
  return axiosInstance.post("/admin/logout",data)
}