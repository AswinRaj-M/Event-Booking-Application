import axios from "axios"

let store;

export const injectStore = (_store) => {
  store = _store
}    
     
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") return `${window.location.origin}/api`;
  return "http://localhost:5000/api";
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
})

// Request interceptor removed as cookies are handled automatically with withCredentials: true


let refreshPromise = null;

const getAuthContext = (state, url = "") => {
  if (!state) return null;

  const hasAdmin = Boolean(state?.admin?.admin);
  const hasVendor = Boolean(state?.vendor?.vendor);
  const hasUser = Boolean(state?.user?.user);

  // If no authenticated session exists in Redux, user is genuinely logged out
  if (!hasAdmin && !hasVendor && !hasUser) {
    return null;
  }

  // Admin route: only refresh if admin session exists
  if (url.includes("/admin")) {
    return hasAdmin ? "admin" : null;
  }

  // Vendor route:
  // - If vendor session exists, use vendor context
  // - If only user session exists (e.g. registered user applying to become vendor), use user context
  if (url.includes("/vendor")) {
    if (hasVendor) return "vendor";
    if (hasUser) return "user";
    return null;
  }

  // General or user routes (/users, /common, etc.)
  if (hasUser) return "user";
  if (hasVendor) return "vendor";
  if (hasAdmin) return "admin";

  return null;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isSuspendedError = error.response?.status === 403 && 
      (error.response?.data?.message?.toLowerCase().includes("suspended") || 
       error.response?.data?.message?.toLowerCase().includes("blocked") ||
       error.response?.data?.message?.toLowerCase().includes("suspend"));

    if (isSuspendedError) {
      console.warn("[Axios Interceptor] Blocked/Suspended user detected. Logging out...");
      
      localStorage.clear();
      sessionStorage.clear();

      let redirectPath = "/login";
      
      try {
        if (store) {
          const state = store.getState();
          if (state.admin?.admin) {
            const { logoutAdminState } = await import("../features/admin.slice.js");
            store.dispatch(logoutAdminState());
            redirectPath = "/admin/login";
          } else if (state.vendor?.vendor) {
            const { vendorLogoutState } = await import("../features/vendorSlice.js");
            store.dispatch(vendorLogoutState());
            redirectPath = "/login";
          } else {
            const { logoutUserState } = await import("../features/user.slice.js");
            store.dispatch(logoutUserState());
            redirectPath = "/login";
          }
        }
      } catch (importErr) {
        console.error("Failed to import/dispatch logout state:", importErr);
      }

      const toastMessage = error.response?.data?.message || "Your account has been suspended by the administrator.";
      localStorage.setItem("userSuspendedToast", toastMessage);

      window.location.href = redirectPath;
      return Promise.reject(error);
    }

    const isAuthRoute = originalRequest.url?.includes('/login') || 
                        originalRequest.url?.includes('/register') ||
                        originalRequest.url?.includes('/verify-otp') ||
                        originalRequest.url?.includes('/refresh-token') ||
                        originalRequest.url?.includes('/forgot-password') ||
                        originalRequest.url?.includes('/reset-password') ||
                        originalRequest.url?.includes('/resend-otp');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      const state = store ? store.getState() : null;
      const authContext = getAuthContext(state, originalRequest.url || "");

      // 1. Genuinely logged-out user receiving 401
      // Do NOT attempt token refresh. Do NOT force-redirect to login.
      // Cleanly reject so caller can handle the unauthenticated state.
      if (!authContext) {
        return Promise.reject(error);
      }

      // 2. Authenticated user whose access token has expired
      originalRequest._retry = true;
      console.log(`[Axios Interceptor] 401 Unauthorized for ${originalRequest.url} (${authContext} session). Refreshing token...`);

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            let refreshAction;

            if (authContext === "admin") {
              const { refreshAdminToken } = await import("../features/admin.slice.js");
              refreshAction = refreshAdminToken;
            } else if (authContext === "vendor") {
              const { refreshVendorToken } = await import("../features/vendorSlice.js");
              refreshAction = refreshVendorToken;
            } else {
              const { refreshUserToken } = await import("../features/user.slice.js");
              refreshAction = refreshUserToken;
            }

            return await store.dispatch(refreshAction()).unwrap();
          })();
        }

        await refreshPromise;
        console.log(`[Axios Interceptor] Token refreshed successfully. Retrying ${originalRequest.url}...`);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error(`[Axios Interceptor] Token refresh failed. Logging out and redirecting...`, refreshError);

        let logoutAction;
        let redirectPath = "/login";

        if (authContext === "admin") {
          const { logoutAdminState } = await import("../features/admin.slice.js");
          logoutAction = logoutAdminState;
          redirectPath = "/admin/login";
        } else if (authContext === "vendor") {
          const { vendorLogoutState } = await import("../features/vendorSlice.js");
          logoutAction = vendorLogoutState;
          redirectPath = "/login";
        } else {
          const { logoutUserState } = await import("../features/user.slice.js");
          logoutAction = logoutUserState;
          redirectPath = "/login";
        }

        if (store && logoutAction) {
          store.dispatch(logoutAction());
        }

        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = redirectPath;
        }

        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
)




export default axiosInstance