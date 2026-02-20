import transporter from "../config/mail.js";

const sendOTP = async(isEmail,otp)=>{
  try {
    await transporter.sendMail({
      from : `"Festivo Events" <${process.env.EMAIL_USER}>`,
      to : email,
      subject : "Verify Your Account - OTP",
      html : `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Event Booking App 🎉</h2>
          <p>Your OTP for account verification is:</p>
          <h1 style="color: #4CAF50; letter-spacing: 3px;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending OTP email :", error)
    throw new Error("Failed to send OTP email")
  }
}

export default sendOTP