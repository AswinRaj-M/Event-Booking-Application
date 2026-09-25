import Vendor from "../../models/vendor.model.js";
import Otp from "../../models/user.otp.model.js";

export const findVendorByIdAndUpdate = async(vendorId,updateData) =>{
  return await Vendor.findByIdAndUpdate(
    vendorId,
    {$set : updateData},
    {new : true}
  )
}

export const findVendorById = async (vendorId) => {
  return await Vendor.findById(vendorId);
};

export const findVendorByBusinessEmail = async (email) => {
  return await Vendor.findOne({ businessEmail: email });
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
};

export const findVendorOtpByUserId = async (vendorId) => {
  return await Otp.findOne({ userId: vendorId });
};

export const deleteVendorOtpByUserId = async (vendorId) => {
  return await Otp.deleteOne({ userId: vendorId });
};
