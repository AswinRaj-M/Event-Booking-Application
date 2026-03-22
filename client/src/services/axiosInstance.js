import axios from "axios"
import { refreshUserToken, logoutUserState } from "../features/user.slice.js"
import { ROUTES } from "../constants/routes";

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

    if (originalRequest.url?.includes('/me')) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshUserToken()).unwrap();
        return axiosInstance(originalRequest);
      } catch (err) {
        // If refresh fails, log out only the specific role based on the request URL if that role is currently active
        const url = originalRequest.url || '';
        const state = store.getState();
        
        if (url.includes('/admin/')) {
          const { logoutAdminState } = await import('../features/admin.slice.js');
          store.dispatch(logoutAdminState());
          // Only force redirect if we were actually expecting to be an admin
          if (state.admin?.admin) {
            window.location.href = ROUTES.ADMIN_LOGIN;
          }
        } else if (url.includes('/vendor/')) {
          const { vendorLogoutState } = await import('../features/vendorSlice.js');
          store.dispatch(vendorLogoutState());
          // Only force redirect if we were actually expecting to be a vendor
          if (state.vendor?.vendor) {
            window.location.href = ROUTES.LOGIN;
          }
        } else {
          store.dispatch(logoutUserState());
          // Only force redirect if we were actually expecting to be a user
          if (state.user?.user) {
            window.location.href = ROUTES.LOGIN;
          }
        }
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance