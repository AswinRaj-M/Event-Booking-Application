import axios from "axios"

let store;

export const injectStore = (_store) => {
  store = _store
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true
})

// Request interceptor removed as cookies are handled automatically with withCredentials: true


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt token refresh for authentication/login/register paths
    const isAuthRoute = originalRequest.url?.includes('/login') || 
                        originalRequest.url?.includes('/register') ||
                        originalRequest.url?.includes('/verify-otp') ||
                        originalRequest.url?.includes('/refresh-token') ||
                        originalRequest.url?.includes('/forgot-password') ||
                        originalRequest.url?.includes('/reset-password');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      console.log(`[Axios Interceptor] 401 Unauthorized for ${originalRequest.url}. Attempting token refresh...`);

      try {
        let refreshAction;
        let logoutAction;
        let redirectPath;

        if (originalRequest.url?.startsWith('/admin')) {
          const { refreshAdminToken, logoutAdminState } = await import("../features/admin.slice.js")
          refreshAction = refreshAdminToken
          logoutAction = logoutAdminState
          redirectPath = "/admin/login"
        } else if (originalRequest.url?.startsWith('/vendor')) {
          const { refreshVendorToken, vendorLogoutState } = await import("../features/vendorSlice.js")
          refreshAction = refreshVendorToken
          logoutAction = vendorLogoutState
          redirectPath = "/vendor/login"
        } else {
          const { refreshUserToken, logoutUserState } = await import("../features/user.slice.js")
          refreshAction = refreshUserToken
          logoutAction = logoutUserState
          redirectPath = "/login"
        }

        await store.dispatch(refreshAction())
        console.log(`[Axios Interceptor] Token refreshed successfully. Retrying ${originalRequest.url}...`);
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error(`[Axios Interceptor] Token refresh failed. Redirecting to login...`, refreshError);
        // Find logoutAction if not already defined (in case dispatch(refreshAction) fails)
        let logoutAction;
        let redirectPath;

        if (originalRequest.url?.startsWith('/admin')) {
          const { logoutAdminState } = await import("../features/admin.slice.js")
          logoutAction = logoutAdminState
          redirectPath = "/admin/login"
        } else if (originalRequest.url?.startsWith('/vendor')) {
          const { vendorLogoutState } = await import("../features/vendorSlice.js")
          logoutAction = vendorLogoutState
          redirectPath = "/vendor/login"
        } else {
          const { logoutUserState } = await import("../features/user.slice.js")
          logoutAction = logoutUserState
          redirectPath = "/login"
        }

        store.dispatch(logoutAction())
        window.location.href = redirectPath
      }
    }

    return Promise.reject(error)
  }

)




export default axiosInstance