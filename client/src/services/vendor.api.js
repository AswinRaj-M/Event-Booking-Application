import axiosInstance from "./axiosInstance";

export const vendorApplication = (data) =>{
  return axiosInstance.post("/vendor/application",data)
}

export const vendorLogin = (data) =>{
  return axiosInstance.post("/vendor/login",data)
}

export const vendorLogout = () =>{
  return axiosInstance.post("/vendor/logout")
}

export const checkVendorStatus = () => {
  return axiosInstance.get("/vendor/status")
}