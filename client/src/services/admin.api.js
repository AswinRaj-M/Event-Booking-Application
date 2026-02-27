import axiosInstance from "./axiosInstance";


export const adminLogin = (data)=>{
  return axiosInstance.post("/admin/login")
}
