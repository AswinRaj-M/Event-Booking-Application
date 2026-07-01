import axiosInstance from "./axiosInstance";

export const vendorApplication = (data) =>{
  return axiosInstance.post("/vendor/application",data)
}

export const vendorLogin = (data) =>{
  return axiosInstance.post("/vendor/login",data)
}

export const vendorProfile = (data) =>{
  return axiosInstance.get('/vendor/profile',data)
}

export const vendorLogout = () =>{
  return axiosInstance.post("/vendor/logout")
}

export const checkVendorStatus = () => {
  return axiosInstance.get("/vendor/status")
}

export const updateVendorImages = (formData) => {
  return axiosInstance.patch("/vendor/profile/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const addVendorPortfolio = (formData) => {
  return axiosInstance.post("/vendor/profile/portfolios", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

export const deleteVendorImage = (imageType) => {
  return axiosInstance.delete(`/vendor/profile/remove-images/${imageType}`);
};

export const deleteVendorPortfolio = (portfolioId) => {
  return axiosInstance.delete(`/vendor/profile/remove-portfolios/${portfolioId}`);
};

export const updateVendorProfile = (data) => {
  return axiosInstance.put("/vendor/update-profile", data);
};

export const fetchCategories = () => {
  return axiosInstance.get("/common/categories");
};

export const verifyVendorOTP = (data) => {
  return axiosInstance.post("/vendor/verify-otp", data);
};

export const resendVendorOtp = (data) => {
  return axiosInstance.post("/vendor/resend-otp", data);
};

export const createEventApi = (formData) => {
  return axiosInstance.post("/vendor/create-event", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getVendorEventsApi = () => {
  return axiosInstance.get("/vendor/my-events");
};

export const cancelEventApi = (eventId) => {
  return axiosInstance.patch(`/vendor/cancel-event/${eventId}`);
};

export const updateEventApi = (eventId, formData) => {
  return axiosInstance.put(`/vendor/update-event/${eventId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteEventApi = (eventId) => {
  return axiosInstance.delete(`/vendor/delete-event/${eventId}`);
};

export const sendVendorEmailUpdateOtp = (newEmail) => {
  return axiosInstance.post("/vendor/send-email-update-otp", { newEmail });
};

export const verifyVendorEmailUpdateOtp = (data) => {
  return axiosInstance.post("/vendor/verify-email-update-otp", data);
};

export const resendVendorEmailUpdateOtp = () => {
  return axiosInstance.post("/vendor/resend-email-update-otp");
};