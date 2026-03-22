export const ROUTES = {
  // Public
  LANDING: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password/:token",

  // User
  HOME: "/home",

  // Vendor Full Paths
  VENDOR_ROOT: "/vendor",
  VENDOR_APPLICATION: "/vendor/application",
  VENDOR_STATUS: "/vendor/status",
  VENDOR_DASHBOARD: "/vendor/dashboard",

  // Vendor Relative Paths (for route definitions)
  VENDOR_APPLICATION_PATH: "application",
  VENDOR_STATUS_PATH: "status",
  VENDOR_DASHBOARD_PATH: "dashboard",

  // Admin Full Paths
  ADMIN_ROOT: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_VENDORS: "/admin/vendors",
  ADMIN_VENDOR_VIEW: "/admin/vendor-application/:id",

  // Admin Relative Paths (for route definitions)
  ADMIN_LOGIN_PATH: "login",
  ADMIN_DASHBOARD_PATH: "dashboard",
  ADMIN_VENDORS_PATH: "vendors",
  ADMIN_VENDOR_VIEW_PATH: "vendor-application/:id",

  // Common
  SPINNER: "/spinner",
};
