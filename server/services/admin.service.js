import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.model.js";

import {
  findAdminByEmail,
  saveAdmin,
  clearAdminRefreshToken,
  findAllVendors,
  findVendorById,
  findVendorByIdFull,
  saveVendor,
  getVendorStats,
  findCategoryByName,
  createCategory,
  getAllCategories,
  getCategoryById,
  saveCategory,
  getallusersRepo,
} from "../repository/admin.repo.js";

export const adminLoginService = async (email, password) => {
  if (!email || !password) {
    throw new AppError("Email and Password are Required", 400);
  }

  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (admin.role !== "admin") {
    throw new AppError("Access Denied. Not An Admin", 403);
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    throw new AppError("Invalid Password", 401);
  }

  return admin;
};

export const logoutAdminService = async (token) => {
  if (token) {
    const hashed = hashToken(token);
    await clearAdminRefreshToken(hashed);
  }
};

export const getAllVendorsService = async (status, page, limit, search, category) => {
  let filter = {};

  if (status) {
    if (status === "approved") {
      filter.applicationStatus = "approved";
      filter.isBlocked = { $ne: true };
    } else if (status === "suspended") {
      filter.applicationStatus = "approved";
      filter.isBlocked = true;
    } else {
      filter.applicationStatus = status;
    }
  }

  if (category && category !== "all") {
    filter.eventCategory = category;
  }

  if (search) {
    filter.$or = [
      { businessName: { $regex: search, $options: "i" } },
      { organizerName: { $regex: search, $options: "i" } },
      { businessEmail: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const { vendors, total } = await findAllVendors(filter, skip, limit);
  const stats = await getVendorStats();
  return {
    data: vendors,
    total,
    stats,
    currentPage: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getVendorByIdService = async (id) => {
  const vendor = await findVendorById(id);

  if (!vendor) {
    throw new AppError("Vendor not Found", 404);
  }

  return vendor;
};

export const vendorApproveService = async (id) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.applicationStatus = "approved";
  await saveVendor(vendor);

  return vendor;
};

export const vendorRejectService = async (id, message) => {
  const vendor = await findVendorByIdFull(id);

  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  vendor.applicationStatus = "rejected";
  vendor.rejectionReason = message;

  await saveVendor(vendor);

  return vendor;
};

export const vendorSuspendService = async(id,message) => {
  const vendor = await findVendorById(id)

  if(!vendor){
    throw new AppError("Vendor not Found!")
  }
  vendor.isBlocked = true
  vendor.refreshToken = null
  
  await saveVendor(vendor)
  return vendor
}

export const vendorUnsuspendService = async(id) => {
  const vendor = await findVendorById(id)

  if(!vendor){
    throw new AppError("Vendor not Found!")
  }
  vendor.isBlocked = false
  
  await saveVendor(vendor)
  return vendor
}


export const createCategoryService = async(name,description,icon) =>{
  if(!name||!description){
    throw new AppError(
      "Name and Description required",
      400
    )
  }

  const existingCategory = await findCategoryByName(name)

  if(existingCategory){
    throw new AppError(
      "Category Already Exists",
      400
    )
  }

  const category = await createCategory({
    name,
    description,
    categoryIcon:icon
  })
  return category
}


export const getAllCategoriesService = async() =>{
  return await getAllCategories()
}


export const getCategoryByIdService = async(id) =>{
  const category = await getCategoryById(id)


  if(!category) {
    throw new AppError(
      "Category not found",
    404
    )
  }

  return category
}


export const updateCategoryService = async(id,name,description,icon) =>{
  const category = await getCategoryById(id)

  if(!category){
    throw new AppError(
      "Category Not Found",
      404
    )
  }

  if(name && name.trim().toLowerCase() !== category.name.trim().toLowerCase()){
    const existingCategory = await findCategoryByName(name.trim())
    if(existingCategory){
      throw new AppError(
        "Category Already Exists",
        400
      )
    }
    category.name = name.trim()
  }

  if(description){
    category.description = description
  }

  if(icon) {
    category.categoryIcon = icon
  }

  await saveCategory(category)

  return category
}


export const toggleCategoryStatusService = async(id) =>{
  const category = await getCategoryById(id)

  if(!category) {
    throw new AppError(
      "Category Not Found",
      404
    )
  }

  category.isActive = !category.isActive;

  await saveCategory(category)

  return category
}


export const deleteCategoryService = async(id) =>{
  const category = await getCategoryById(id)
  if(!category){
    throw new AppError(
      "Category Not Found",
      404
    )
  }

  category.isDeleted = true

  await saveCategory(category)
}


export const getAllUsersService = async() =>{
  return await getallusersRepo()
}

export const toggleUserBlockService = async(id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  user.isBlocked = !user.isBlocked;
  if (user.isBlocked) {
    user.refreshToken = null;
  }
  await user.save();
  return user;
}

