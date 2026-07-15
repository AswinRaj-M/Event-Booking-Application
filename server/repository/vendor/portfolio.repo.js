import Vendor from "../../models/vendor.model.js";

export const addVendorPortfolioPicture = async (vendorId, fileData) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $push: { portfolioPictures: fileData } },
    { new: true }
  );
};

export const removeVendorImage = async (vendorId, imageField) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $unset: { [imageField]: 1 } },
    { new: true }
  );
};

export const removeVendorPortfolioPicture = async (vendorId, pictureId) => {
  return await Vendor.findByIdAndUpdate(
    vendorId,
    { $pull: { portfolioPictures: { _id: pictureId } } },
    { new: true }
  );
};
