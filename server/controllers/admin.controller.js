import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { hashToken } from "../utils/hashToken.js";
import { sendMail } from "../utils/sendMail.js";
import {
  adminLoginService,
  logoutAdminService,
  getAllVendorsService,
  getVendorByIdService,
  vendorApproveService,
  vendorRejectService,
  createCategoryService,
  getAllCategoriesService,
  updateCategoryService,
  deleteCategoryService,
  toggleCategoryStatusService,
  vendorSuspendService,
  vendorUnsuspendService,
  getAllUsersService,
  toggleUserBlockService,
  getAllEventsService,
  toggleBlockEventService,
} from "../services/admin.service.js";
import { saveAdmin } from "../repository/admin.repo.js"
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";


export const AdminLogin = async (req, res) => {
  const { email, password } = req.body;
 

  const admin = await adminLoginService(email, password);

  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  admin.refreshToken = hashToken(refreshToken);
  await saveAdmin(admin);


  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({
    message: "Admin Logged In Successfully",
    admin: {
      id: admin._id,
      name: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
};


export const logoutAdmin = async (req, res) => {
  const token = req.cookies.refreshToken;

  await logoutAdminService(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(200).json({
    message: "Admin Logged Out Successfully",
  });
};


export const getAllVendors = async (req, res) => {
  const { status, page = 1, limit = 4, search, category } = req.query;

  const result = await getAllVendorsService(status, page, limit, search, category)

  return res.status(200).json({
    success: true,
    ...result,
  });
};


export const getVendorById = async (req, res) => {
  const id = req.params.id;

  const vendor = await getVendorByIdService(id);

  return res.status(200).json({
    success: true,
    data: vendor,
  });
};


export const vendorApprove = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorApproveService(id);

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Vendor Application Approved!"
    );
  } catch (err) {
    console.error("Error sending approval email:", err.message);
  }

  return res.status(200).json({
    message: "Application Approved",
  });
};


export const vendorReject = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorRejectService(id, message);

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Vendor Application rejected!"
    );
  } catch (err) {
    console.error("Error sending rejection email:", err.message);
  }

  return res.status(200).json({
    success : true,
    message: "Application Rejected!",
  });
};

export const vendorSuspend = async(req,res) =>{
  const {id,message} = req.body

  const vendor = await vendorSuspendService(id,message)

  try {
    await sendMail(
      vendor.businessEmail,
      message, 
      "You have been suspended"
    );
  } catch (err) {
    console.error("Error sending suspension email:", err.message);
  }

  return res.status(200).json({
    success : true,
    message : "Vendor suspended Successfully!"
  })

}

export const vendorUnsuspend = async(req,res) =>{
  const {id,message} = req.body

  const vendor = await vendorUnsuspendService(id)

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Suspension Lifted"
    );
  } catch (err) {
    console.error("Error sending unsuspension email:", err.message);
  }

  return res.status(200).json({
    success : true,
    message : "Vendor unsuspended Successfully!"
  })

}

export const VendorSendEmail = async (req, res) => {
  const { businessEmail, message } = req.body;
  try {
    await sendMail(
      businessEmail,
      message,
      "Message From Festivo Admin!"
    );
  } catch (err) {
    console.error("Error sending email to vendor:", err.message);
  }

  return res.status(200).json({
    message: "Message send Successfully"
  })
}

export const createCategories = async (req, res) => {
  const { name, description, icon } = req.body

  const uploadIcon = await uploadToCloudinary(
    req.files.categoryIcon[0].buffer,
    'profileImages/categoryIcon'
  )

  const category = await createCategoryService(name, description, {
    fileUrl: uploadIcon.secure_url,
    publicId: uploadIcon.public_id,
    fileType: uploadIcon.resource_type,
  },)

  return res.status(201).json({
    success: true,
    message: "Category Created SuccessfUlly",
    data: category
  })
}


export const getAllCategories = async (req, res) => {
  const categories = await getAllCategoriesService()

  return res.status(200).json({
    success: true,
    data: categories
  })
}


export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  let iconData;
  if (req.files && req.files.categoryIcon && req.files.categoryIcon[0]) {
    const uploadIcon = await uploadToCloudinary(
      req.files.categoryIcon[0].buffer,
      'profileImages/categoryIcon'
    );
    iconData = {
      fileUrl: uploadIcon.secure_url,
      publicId: uploadIcon.public_id,
      fileType: uploadIcon.resource_type,
    };
  }

  const category = await updateCategoryService(id, name, description, iconData);

  return res.status(200).json({
    success: true,
    message: "Category Updated Successfully",
    data: category
  });
}


export const toggleCategoryStatus = async (req, res) => {

  const { id } = req.params

  const category = await toggleCategoryStatusService(id)

  return res.status(200).json({
    success: true,
    message: "Category Status Updated",
    data: category
  })
}


export const deleteCategory = async (req, res) => {

  const { id } = req.params;

  await deleteCategoryService(id)

  return res.status(200).json({
    success: true,
    message: "Category Deleted Successfully"
  })
}

export const getAllUsers = async(req,res) =>{
  const users = await getAllUsersService()
  
  return res.status(200).json({
    success : true,
    message : "Users fetched Successfully",
    data : users
  })
}

export const toggleUserBlock = async(req,res) => {
  const { id } = req.params
  const user = await toggleUserBlockService(id)
  
  return res.status(200).json({
    success : true,
    message : `User ${user.isBlocked ? 'Blocked' : 'Unblocked'} Successfully!`,
    data : user
  })
}

export const getAllEventsAdmin = async (req, res) => {
  const events = await getAllEventsService();
  return res.status(200).json({
    success: true,
    message: "Events fetched successfully",
    events
  });
};       

export const toggleBlockEvent = async (req, res) => {
  const { eventId } = req.params;
  const { reason } = req.body;
  const event = await toggleBlockEventService(eventId, reason);
  return res.status(200).json({
    success: true,
    message: `Event status updated successfully`,
    event
  });
};



