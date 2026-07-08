import { HTTP_STATUS } from "../utils/enums/http.status.enum.js";

export const requireRole = (...roles) =>{
  return (req,res,next) =>{
    if(!req.user){
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message :  "Not Authenticated"
      })
    }

    if(!roles.includes(req.user.role)){
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        message : "Access denied"
      })
    }

    next()
  }
}