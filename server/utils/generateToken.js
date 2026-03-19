import jwt from "jsonwebtoken"


export const generateAccessToken = (userId, role) =>{
  return jwt.sign(
    { id: userId.toString(), role: role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn : process.env.ACCESS_TOKEN_EXPIRES }
  );
};


export const generateRefreshToken = (userId) =>{
  return jwt.sign(
    { id: userId.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn : process.env.REFRESH_TOKEN_EXPIRES }
  )
}

export const generateResetToken = (userId,email) =>{
  return jwt.sign(
    {id : userId.toString(),email : email},
    process.env.JWT_RESET_SECRET,
    {expiresIn : "15m"}
  )
}