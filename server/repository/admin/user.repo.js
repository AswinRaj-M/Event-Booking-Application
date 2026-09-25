import User from "../../models/user.model.js";

export const getallusersRepo = async() =>{
  return await User.find()
  .select("-password")
}

export const findUserByIdRepo = async (id) => {
  return await User.findById(id);
};

export const saveUserRepo = async (user) => {
  return await user.save();
};
