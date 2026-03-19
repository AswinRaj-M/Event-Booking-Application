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
  VENDOR_EVENTS: "/vendor/events",
  VENDOR_DRAFT_EVENTS: "/vendor/events/drafts",
  VENDOR_CREATE_EVENT: "/vendor/events/create",
  VENDOR_BOOKINGS: "/vendor/bookings",
  VENDOR_EARNINGS: "/vendor/earnings",
  VENDOR_PROFILE: "/vendor/profile",
  VENDOR_SETTINGS: "/vendor/settings",

  // Vendor Relative Paths (for route definitions)
  VENDOR_APPLICATION_PATH: "application",
  VENDOR_STATUS_PATH: "status",
  VENDOR_DASHBOARD_PATH: "dashboard",
  VENDOR_EVENTS_PATH: "events",
  VENDOR_DRAFT_EVENTS_PATH: "events/drafts",
  VENDOR_CREATE_EVENT_PATH: "events/create",
  VENDOR_BOOKINGS_PATH: "bookings",
  VENDOR_EARNINGS_PATH: "earnings",
  VENDOR_PROFILE_PATH: "profile",
  VENDOR_SETTINGS_PATH: "settings",

  // Admin Full Paths
  ADMIN_ROOT: "/admin",
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_VENDORS: "/admin/vendors",
  ADMIN_USER_MANAGEMENT: "/admin/users",
  ADMIN_EVENT_MANAGEMENT: "/admin/events",
  ADMIN_BOOKING_MANAGEMENT: "/admin/bookings",
  ADMIN_PAYMENT_MANAGEMENT: "/admin/payments",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_VENDOR_VIEW: "/admin/vendor-application/:id",

  // Admin Relative Paths (for route definitions)
  ADMIN_LOGIN_PATH: "login",
  ADMIN_DASHBOARD_PATH: "dashboard",
  ADMIN_VENDORS_PATH: "vendors",
  ADMIN_VENDOR_VIEW_PATH: "vendor-application/:id",

  // Common
  SPINNER: "/spinner",
};
