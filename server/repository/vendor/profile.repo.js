import Vendor from "../../models/vendor.model.js";

export const findVendorByIdAndUpdate = async(vendorId,updateData) =>{
  return await Vendor.findByIdAndUpdate(
    vendorId,
    {$set : updateData},
    {new : true}
  )
}
