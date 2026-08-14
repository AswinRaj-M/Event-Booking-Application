import axiosInstance from "./axiosInstance";


export const adminLogin = (data) => {
  return axiosInstance.post("/admin/login", data)
}

export const logoutAdmin = (data) => {
  return axiosInstance.post("/admin/logout", data)
}

export const getAllVendors = ({ status, page, limit, search, category }) => {
  return axiosInstance.get("/admin/vendorManagement", {
    params: { status, page, limit, search, category }
  })
}

export const getVendorById = (id) => {
  return axiosInstance.get(`/admin/vendor-application/${id}`)
}

export const approveVendorApplication = (id, message) => {
  return axiosInstance.patch(`/admin/vendors/approve-application`, { id, message })
}

export const rejectVendorAppplication = (id, message) => {
  return axiosInstance.patch(`/admin/vendors/reject-application`, { id, message })
}

export const suspendVendor = (id,message) =>{
  return axiosInstance.patch('/admin/vendors/suspend-vendor',{id,message})
}

export const unsuspendVendor = (id, message) => {
  return axiosInstance.patch('/admin/vendors/unsuspend-vendor', { id, message })
}

export const VendorSendEmail = (businessEmail, message) => {
  return axiosInstance.post(`/admin/vendors/send-email`, { businessEmail, message })
}

export const fetchAllUsers = () =>{
  return axiosInstance.get("/admin/users-management")
}

export const toggleUserBlock = (id) => {
  return axiosInstance.patch(`/admin/users/toggle-block/${id}`)
}

export const createCategory = (data) => {
  return axiosInstance.post("/admin/create-category", data)
}

export const updateCategory = (id, data) => {
  return axiosInstance.put(`/admin/update-category/${id}`, data)
}

export const toggleCategoryStatus = (id) => {
  return axiosInstance.put(`/admin/status-update/${id}`)
}

export const deleteCategory = (id) => {
  return axiosInstance.delete(`/admin/delete-category/${id}`)
}

export const fetchAllEventsAdmin = () => {
  return axiosInstance.get("/admin/events-management");
};

export const toggleBlockEventApi = (eventId, data) => {
  return axiosInstance.patch(`/admin/events/toggle-block/${eventId}`, data);
};

export const createCouponApi = (data) => {
  return axiosInstance.post("/admin/coupons", data);
};

export const updateCouponApi = (id, data) => {
  return axiosInstance.put(`/admin/coupons/${id}`, data);
};

export const getAllCouponsApi = (params = {}) => {
  return axiosInstance.get("/admin/coupons", { params });
};

export const toggleCouponStatusApi = (id) => {
  return axiosInstance.patch(`/admin/coupons/toggle-status/${id}`);
};

export const deleteCouponApi = (id) => {
  return axiosInstance.delete(`/admin/coupons/${id}`);
};

export const getAdminWithdrawalsApi = (status) => {
  return axiosInstance.get("/admin/withdrawals" + (status ? `?status=${status}` : ""));
};

export const approveWithdrawalApi = (id) => {
  return axiosInstance.patch(`/admin/withdrawals/${id}/approve`);
};

export const rejectWithdrawalApi = (id, rejectionReason) => {
  return axiosInstance.patch(`/admin/withdrawals/${id}/reject`, { rejectionReason });
};

// Admin Wallet APIs
export const createAdminWalletOrderApi = (amount) => {
  return axiosInstance.post("/admin/wallet/create-order", { amount });
};

export const verifyAdminWalletPaymentApi = (paymentData) => {
  return axiosInstance.post("/admin/wallet/verify-payment", paymentData);
};

export const recordAdminWalletPaymentFailureApi = (data) => {
  return axiosInstance.post("/admin/wallet/record-failure", data);
};

export const getAdminWalletDetailsApi = (params = {}) => {
  return axiosInstance.get("/admin/wallet/details", { params });
};

// Admin Analytics API
export const getAdminAnalyticsApi = (params = {}) => {
  return axiosInstance.get("/admin/analytics", { params });
};