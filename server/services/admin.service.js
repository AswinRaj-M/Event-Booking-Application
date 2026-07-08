import bcrypt from "bcryptjs";
import { hashToken } from "../utils/hashToken.js";
import { AppError } from "../utils/AppError.js";
import User from "../models/user.model.js";
import { sendMail } from "../utils/sendMail.js";

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
  getAllEventsRepo,
  findEventById,
  saveEvent,
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


export const getAllCategoriesService = async (query = {}) => {
  const { page, limit, search, status, sortBy } = query;
  
  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  
  if (status && status !== "all") {
    filter.isActive = status === "active";
  }
  
  let sort = { createdAt: -1 };
  if (sortBy === "name") {
    sort = { name: 1 };
  } else if (sortBy === "newest") {
    sort = { createdAt: -1 };
  }
  
  if (page && limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;
    
    const { categories, total } = await getAllCategories(filter, sort, skip, limitNum);
    return {
      categories,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    };
  } else {
    const { categories } = await getAllCategories(filter, sort, 0, 0);
    return categories;
  }
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

export const getAllEventsService = async () => {
  return await getAllEventsRepo();
};
 
export const toggleBlockEventService = async (eventId, reason) => {
  const event = await findEventById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404);
  }
  event.isBlocked = !event.isBlocked;
  if (event.isBlocked) {
    event.blockedReason = reason || "";
    const vendor = await findVendorById(event.vendorId);
    if (vendor && vendor.businessEmail) {
      const emailSubject = `Event Blocked: ${event.title}`;
      const emailBody = `Dear ${vendor.organizerName || 'Vendor'},<br/><br/>We regret to inform you that your event "<strong>${event.title}</strong>" has been blocked by the platform administrator for the following reason:<br/><br/><em>"${reason || "No reason specified"}"</em><br/><br/>If you believe this is a mistake, please contact platform support.`;
      try {
        await sendMail(vendor.businessEmail, emailBody, emailSubject);
      } catch (err) {
        console.error("Failed to send block notification email:", err);
      }
    }
  } else {
    event.blockedReason = undefined;
  }
  await saveEvent(event);
  
  const all = await getAllEventsRepo();
  return all.find(e => e._id.toString() === eventId);
}

