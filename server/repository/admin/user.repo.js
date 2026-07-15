import User from "../../models/user.model.js";

export const getallusersRepo = async() =>{
  return await User.find()
  .select("-password")
}
