import crypto from "crypto"

export const generateTicketNumber = ()=>{
  const year = new Date().getFullYear()
  const randomDigits = crypto.randomInt(100000,999999)
  return `TKT-${year}-${randomDigits}`
}