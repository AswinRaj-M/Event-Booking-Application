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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url?.endsWith('/me')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshUserToken()).unwrap()
        return axiosInstance(originalRequest)
      } catch (err) {
        if (window.location.pathname.startsWith('/admin')) {
          const { logoutAdminState } = await import('../features/admin.slice.js');
          store.dispatch(logoutAdminState());
          window.location.href = "/admin/login";
        } else if (window.location.pathname.startsWith('/vendor')) {
          const { vendorLogoutState } = await import('../features/vendorSlice.js');
          store.dispatch(vendorLogoutState());
          window.location.href = "/login";
        } else {
          store.dispatch(logoutUserState());
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance