import User from "../../models/user.model.js";

export const getallusersRepo = async() =>{
  return await User.find()
  .select("-password")
  .sort({createdAt : -1})
}

export const findUserByIdRepo = async (id) => {
  return await User.findById(id);
};

export const saveUserRepo = async (user) => {
  return await user.save();
};
