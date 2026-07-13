import { body } from "express-validator"

export const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/)
    .withMessage("Full name can only contain letters, numbers, and single spaces, hyphens, or underscores")
    .custom((value) => {
      if (value.includes("__")) {
        throw new Error("Full name cannot contain consecutive underscores");
      }
      return true;
    }),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match")
      }
      return true
    }),

  body("agreeTermsAndConditions")
    .custom((value) => value === true || value === "true")
    .withMessage("You must agree to the terms and conditions")
]

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
]

export const verifyOTPValidation = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4-6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers")
]

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm new password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match")
      }
      return true
    })
]

export const userProfileUpdateValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/)
    .withMessage("Full name can only contain letters, numbers, and single spaces, hyphens, or underscores")
    .custom((value) => {
      if (value.includes("__")) {
        throw new Error("Full name cannot contain consecutive underscores");
      }
      return true;
    }),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),
]
