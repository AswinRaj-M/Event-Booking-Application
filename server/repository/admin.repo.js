import User from "../models/user.model.js";
import Vendor from "../models/vendor.model.js";
import Category from "../models/category.model.js"

export const findAdminByEmail = async (email) => {
  return await User.findOne({ email });
};

export const saveAdmin = async (admin) => {
  return await admin.save();
};

export const clearAdminRefreshToken = async (token) => {
  return await User.findOneAndUpdate(
    { refreshToken: token },
    { $set: { refreshToken: null } }
  );
};

export const findAllVendors = async (filter, skip, limit) => {
  const vendors = await Vendor.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Vendor.countDocuments(filter);
  return { vendors, total };
};

export const getVendorStats = async () => {
  const [pending, approved, rejected, suspended, total] = await Promise.all([
    Vendor.countDocuments({ applicationStatus: "pending" }),
    Vendor.countDocuments({ applicationStatus: "approved", isBlocked: { $ne: true } }),
    Vendor.countDocuments({ applicationStatus: "rejected" }),
    Vendor.countDocuments({ applicationStatus: "approved", isBlocked: true }),
    Vendor.countDocuments({}),
  ]);
  return { pending, approved, rejected, suspended, total };
};

export const findVendorById = async (id) => {
  return await Vendor.findById(id).select("-password");
};

export const findVendorByIdFull = async (id) => {
  return await Vendor.findById(id);
};

export const saveVendor = async (vendor) => {
  return await vendor.save();
};


export const findCategoryByName = async(name)=>{
  return await Category.findOne({
    name,
    isDeleted : false
  })
}
export const createCategory = async(data) =>{
  return await Category.create(data)
}

export const getAllCategories = async() =>{
  return await Category.find({
    isDeleted : false,
  }).sort({
    createdAt : -1
  })
}


export const  getCategoryById = async(id) =>{
  return Category.findOne({
    _id : id,
    isDeleted : false
  })
}

export const saveCategory  =  async(category) =>{
  return await category.save()
}

export const getallusersRepo = async() =>{
  return await User.find()
  .select("-password")
}