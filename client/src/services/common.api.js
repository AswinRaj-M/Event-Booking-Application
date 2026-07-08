import axiosInstance from "./axiosInstance"


export const getAllCategories = (params = {}) => {
  return axiosInstance.get("/common/categories", { params })
}