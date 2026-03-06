import { data } from "react-router-dom";
import axiosInstance from "./axiosInstance";


export const adminLogin = (data)=>{
  return axiosInstance.post("/admin/login",data)
}

export const logoutAdmin = (data) =>{
  return axiosInstance.post("/admin/logout",data)
}

export const getAllVendors = (data) => {
  return axiosInstance.get("/admin/vendorManagement",data)
}