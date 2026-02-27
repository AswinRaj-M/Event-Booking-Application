import {getTransporter} from "../config/mail.js"


const sendOTP = async (email, otp) => {
  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Festivo Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Festivo OTP - Verify Your Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color:#f4f4f4;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:20px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #6b48ff, #9d4edd); padding:30px 20px; text-align:center; color:white;">
                <h1 style="margin:0; font-size:28px;">Festivo Events</h1>
                <p style="margin:8px 0 0; font-size:16px; opacity:0.9;">Verify Your Account</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding:40px 30px; text-align:center;">
                <h2 style="margin:0 0 20px; font-size:22px; color:#333;">Your Verification Code</h2>
                <div style="font-size:42px; font-weight:bold; letter-spacing:12px; color:#4CAF50; background:#f8f9fa; padding:20px; border-radius:12px; display:inline-block; margin:20px 0;">
                  ${otp}
                </div>
                <p style="font-size:16px; color:#555; line-height:1.6; margin:0 0 30px;">
                  This code will expire in <strong>5 minutes</strong>.<br>
                  Please do not share it with anyone.
                </p>
                <p style="font-size:14px; color:#777; margin:0;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f9fa; padding:20px; text-align:center; font-size:13px; color:#666;">
                <p style="margin:0;">Festivo Events © ${new Date().getFullYear()}</p>
                <p style="margin:8px 0 0;">Kanhangad, Kerala</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email :", error);
    throw new Error("Failed to send OTP email");
  }
};

export default sendOTP