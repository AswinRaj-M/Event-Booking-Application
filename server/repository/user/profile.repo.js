import User from "../../models/user.model.js";

export const findUserById = async (userId) => {
  return await User.findById(userId);
};


export const updateUser = async (userId, data) => {
  return await User.findByIdAndUpdate(userId, data, {
    new: true,
  });
};

export const updatePassword = async(userId,password) =>{
  return await User.findByIdAndUpdate(
    userId,
    {
      password,
      passwordChangedAt : Date.now()
    },
    {new : true}
  )
}
