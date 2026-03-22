import { updateVendorStatus, updateVendorData, findVendorById } from "./vendor.service.js"
import { sendMail } from "../utils/sendMail.js"
import { AppError } from "../utils/AppError.js"

export const approveVendorApplication = async (id, message) => {
  const vendor = await updateVendorStatus(id, "approved");
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }
  
  await sendMail(vendor.businessEmail, message, "Vendor Application Approved!");
  return vendor;
};

export const rejectVendorApplication = async (id, message) => {
  const vendor = await updateVendorData(id, {
    applicationStatus: 'rejected',
    rejectionReason: message
  });
  
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }
  
  await sendMail(vendor.businessEmail, message, 'Vendor Application rejected!');
  return vendor;
};
