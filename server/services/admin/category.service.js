import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  findCategoryByName,
  createCategory,
  getAllCategories,
  getCategoryById,
  saveCategory,
} from "../../repository/admin/category.repo.js";

export const createCategoryService = async(name,description,icon) =>{
  if(!name||!description){
    throw new AppError(
      "Name and Description required",
      HTTP_STATUS.BAD_REQUEST
    )
  }

  const existingCategory = await findCategoryByName(name)

  if(existingCategory){
    throw new AppError(
      "Category Already Exists",
      HTTP_STATUS.BAD_REQUEST
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
      HTTP_STATUS.NOT_FOUND
    )
  }

  return category
}


export const updateCategoryService = async(id,name,description,icon) =>{
  const category = await getCategoryById(id)

  if(!category){
    throw new AppError(
      "Category Not Found",
      HTTP_STATUS.NOT_FOUND
    )
  }

  if(name && name.trim().toLowerCase() !== category.name.trim().toLowerCase()){
    const existingCategory = await findCategoryByName(name.trim())
    if(existingCategory){
      throw new AppError(
        "Category Already Exists",
        HTTP_STATUS.BAD_REQUEST
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
      HTTP_STATUS.NOT_FOUND
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
      HTTP_STATUS.NOT_FOUND
    )
  }

  category.isDeleted = true

  await saveCategory(category)
}
