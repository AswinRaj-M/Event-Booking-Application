import axiosInstance from "./axiosInstance.js"


export const registerUser =(data) => {
 return axiosInstance.post("/users/register",data)
}

export const verifyOTP = (data) =>{
  return axiosInstance.post("/users/verify-otp",data)
}

export const resendOtp = (userId) =>{
  return axiosInstance.post("/users/resend-otp",{userId})
}

export const loginUser = (data) =>{
  return axiosInstance.post("/users/login",data)
}

export const forgotPassword = (email) =>{
  return axiosInstance.post("/users/forgot-password",{email})
}

export const resetPassword = (resetToken,password) =>{
  return axiosInstance.patch("/users/reset-password",{resetToken,password})
}

export const logoutUser = ()=>{
  return axiosInstance.post("/users/logout")
}

export const refreshUser = ()=>{
  return axiosInstance.get("/users/refresh-token")
}

export const getUserProfile = () => {
  return axiosInstance.get("/users/profile")
}

export const updateUserProfile = (data) => {
  return axiosInstance.put("/users/update-profile", data)
}

export const updateUserProfilePicture = (formData) => {
  return axiosInstance.patch("/users/profile/picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}

export const getExploreEvents = (params) => {
  return axiosInstance.get("/users/explore-events", { params });
};

export const sendEmailUpdateOtp = (newEmail) => {
  return axiosInstance.post("/users/send-email-update-otp", { newEmail });
}

export const verifyEmailUpdateOtp = (data) => {
  return axiosInstance.post("/users/verify-email-update-otp", data);
}

export const resendEmailUpdateOtp = () => {
  return axiosInstance.post("/users/resend-email-update-otp");
}

export const getEventById = (id) => {
  return axiosInstance.get(`/users/events/${id}`);
};

export const bookEventTickets = (id, bookingData) => {
  return axiosInstance.post(`/users/events/${id}/book`, bookingData);
};