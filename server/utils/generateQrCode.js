import QRCode from "qrcode"

export const generateQRCode = async(qrCodeToken) =>{
  if(!qrCodeToken) return ""
  try {
    const dataUrl = await QRCode.toDataURL(qrCodeToken,{
      errorCorrectionLevel : "H",
      type : "image/png",
      width : 300,
      margin : 2
    })
    return dataUrl
  } catch (error) {
    console.error("Error from generate qrcode",error)
    return ""
  }
}