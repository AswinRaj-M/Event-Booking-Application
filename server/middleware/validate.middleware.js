import { validationResult } from "express-validator"
import { AppError } from "../utils/AppError.js"
import { HTTP_STATUS } from "../utils/enums/http.status.enum.js"

export const validate = (req,res,next)=>{
  const errors = validationResult(req)

  if(!errors.isEmpty()){
    throw new AppError(errors.array()[0].msg,HTTP_STATUS.BAD_REQUEST)
  }

  next()
}
