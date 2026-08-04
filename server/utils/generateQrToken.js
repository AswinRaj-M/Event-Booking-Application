import crypto from "crypto"

export const generateQrToken = () =>{
  return crypto.randomBytes(32).toString("hex")
}