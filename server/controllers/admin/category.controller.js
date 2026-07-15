import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  createCategoryService,
  getAllCategoriesService,
  updateCategoryService,
  toggleCategoryStatusService,
  deleteCategoryService,
} from "../../services/admin/category.service.js";

export const createCategories = async (req, res) => {
  const { name, description } = req.body

  const uploadIcon = await uploadToCloudinary(
    req.files.categoryIcon[0].buffer,
    'profileImages/categoryIcon'
  )

  const category = await createCategoryService(name, description, {
    fileUrl: uploadIcon.secure_url,
    publicId: uploadIcon.public_id,
    fileType: uploadIcon.resource_type,
  })

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Category Created SuccessfUlly",
    data: category
  })
}


export const getAllCategories = async (req, res) => {
  const { page, limit, search, status, sortBy } = req.query;

  const result = await getAllCategoriesService({ page, limit, search, status, sortBy });

  if (page && limit) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result.categories,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      total: result.total
    });
  } else {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  }
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

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Category Updated Successfully",
    data: category
  });
}


export const toggleCategoryStatus = async (req, res) => {

  const { id } = req.params

  const category = await toggleCategoryStatusService(id)

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Category Status Updated",
    data: category
  })
}


export const deleteCategory = async (req, res) => {

  const { id } = req.params;

  await deleteCategoryService(id)

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Category Deleted Successfully"
  })
}
