import axiosInstance from "./axiosInstance";

export const vendorApplication = (data) =>{
  return axiosInstance.post("/vendor/application",data)
}