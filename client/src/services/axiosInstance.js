import axios from "axios"
import { refreshUserToken, logoutUserState } from "../features/user.slice.js"

let store;

export const injectStore = (_store) => {
  store = _store
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
})

axiosInstance.interceptors.request.use((config) => {
  const state = store.getState()
  let token = state.user?.accessToken;

  if (config.url?.startsWith('/admin')) {
    token = state.admin?.accessToken;
  } else if (config.url?.startsWith('/vendor')) {
    token = state.vendor?.accessToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config;
})


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshUserToken())
        return axiosInstance(originalRequest)
      } catch (error) {
        store.dispatch(logoutUserState())
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }

)




export default axiosInstance