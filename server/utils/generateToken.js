import jwt from "jsonwebtoken"
import { TOKEN_EXPIRES } from "./constants.js"


export const generateAccessToken = (user) =>{
  return jwt.sign(
    {id :  user.id, role : user.role},
    process.env.JWT_ACCESS_SECRET,
    {expiresIn : TOKEN_EXPIRES.ACCESS}
  );
};


export const generateRefreshToken = (user) =>{
  return jwt.sign(
    {id : user.id},
    process.env.JWT_REFRESH_SECRET,
    {expiresIn : TOKEN_EXPIRES.REFRESH}
  )
}