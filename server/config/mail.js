import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = () => {
  if (!transporter) {
    console.log("[MAIL] Creating transporter now...");
    console.log("[MAIL] EMAIL_USER:", process.env.EMAIL_USER);
    console.log("[MAIL] EMAIL_PASS length:", process.env.EMAIL_PASS?.length || "missing");

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    
    transporter.verify((err) => {
      if (err) {
        console.error("[MAIL] Verification failed:", err.message);
      } else {
        console.log("[MAIL] Transporter ready");
      }
    });
  }
  return transporter;
};