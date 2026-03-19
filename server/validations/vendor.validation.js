import { body } from "express-validator";
import Vendor from "../models/vendor.model.js";
import bcrypt from "bcryptjs";

export const vendorApplyValidation = [
body().custom((value, { req }) => {
  const {
    organizerName,
    businessName,
    businessEmail,
    password,
    contactPhone,
  } = req.body;

  if (
    !organizerName ||
    !businessName ||
    !businessEmail ||
    !password ||
    !contactPhone
  ) {
    throw new Error("All fields are required");
  }

  return true;
}).bail(),
  body("organizerName")
    .trim()
    .notEmpty()
    .withMessage("Organizer name is required")
    .isLength({ min: 3 })
    .withMessage("Organizer name must be at least 3 characters"),

  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),

  body("businessEmail")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .custom(async (email) => {
      const existingVendor = await Vendor.findOne({ businessEmail: email });
      if (existingVendor) {
        throw new Error("Application already submitted with this email");
      }
      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("contactPhone")
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must be between 10 and 15 digits"),

  body("eventCategory")
    .notEmpty()
    .withMessage("Event category is required"),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required"),

  body("description")
    .trim()
    .isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),

  body("agreeTermsAndConditions")
    .notEmpty()
    .withMessage("Terms must be accepted")
];



export const vendorLoginValidation = [

  body("businessEmail")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .custom(async (email, { req }) => {

      const vendor = await Vendor.findOne({ businessEmail: email });

      if (!vendor) {
        throw new Error("Invalid Credentials");
      }

      req.vendor = vendor;

      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (password, { req }) => {

      const vendor = req.vendor;
      if (!vendor) return true;

      const match = await bcrypt.compare(password, vendor.password);

      if (!match) {
        throw new Error("Incorrect Password");
      }

      return true;
    })
];
