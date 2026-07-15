import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  getAllUsersService,
  toggleUserBlockService,
} from "../../services/admin/user.service.js";

export const getAllUsers = async(req,res) =>{
  const users = await getAllUsersService()
  
  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : "Users fetched Successfully",
    data : users
  })
}

export const toggleUserBlock = async(req,res) => {
  const { id } = req.params
  const user = await toggleUserBlockService(id)
  
  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : `User ${user.isBlocked ? 'Blocked' : 'Unblocked'} Successfully!`,
    data : user
  })
}
