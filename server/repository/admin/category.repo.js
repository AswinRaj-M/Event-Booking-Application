import Category from "../../models/category.model.js";

export const findCategoryByName = async(name)=>{
  return await Category.findOne({
    name,
    isDeleted : false
  })
}
export const createCategory = async(data) =>{
  return await Category.create(data)
}

export const getAllCategories = async (filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 0) => {
  let query = Category.find({ ...filter, isDeleted: false }).sort(sort);
  if (limit > 0) {
    query = query.skip(skip).limit(limit);
  }
  const categories = await query;
  const total = await Category.countDocuments({ ...filter, isDeleted: false });
  return { categories, total };
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
