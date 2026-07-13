import { body } from "express-validator";
import Vendor from "../models/vendor.model.js";
import bcrypt from "bcryptjs";

export const vendorApplyValidation = [

  body("organizerName")
    .trim()
    .notEmpty()
    .withMessage("Organizer name is required")
    .isLength({ min: 3 })
    .withMessage("Organizer name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/)
    .withMessage("Organizer name can only contain letters, numbers, and single spaces, hyphens, or underscores")
    .custom((value) => {
      if (value.includes("__")) {
        throw new Error("Organizer name cannot contain consecutive underscores");
      }
      return true;
    }),

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

      if (vendor.isBlocked) {
        throw new Error("You have been suspended");
      }

      req.vendor = vendor;

      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .custom(async (password, { req }) => {

      const vendor = req.vendor;
      if(!vendor) return true; 
      const match = await bcrypt.compare(password, vendor.password);

      if (!match) {
        throw new Error("Incorrect Password");
      }

    })
];

export const vendorProfileUpdateValidation = [
  body("organizerName")
    .trim()
    .notEmpty()
    .withMessage("Organizer name is required")
    .isLength({ min: 3 })
    .withMessage("Organizer name must be at least 3 characters")
    .matches(/^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/)
    .withMessage("Organizer name can only contain letters, numbers, and single spaces, hyphens, or underscores")
    .custom((value) => {
      if (value.includes("__")) {
        throw new Error("Organizer name cannot contain consecutive underscores");
      }
      return true;
    }),

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

  body("contactPhone")
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Phone number must be between 10 and 15 digits"),
];

export const eventCreateValidation = [
  body("date")
    .if((value, { req }) => req.body.eventStatus !== "draft")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Valid event date is required")
    .custom((value) => {
      if (!value) return true;
      const eventDate = new Date(value);
      const today = new Date();
      
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();

      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();

      const eventDateOnly = new Date(eventYear, eventMonth, eventDay);
      const todayDateOnly = new Date(todayYear, todayMonth, todayDay);

      if (eventDateOnly < todayDateOnly) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),
];

export const eventUpdateValidation = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Valid event date is required")
    .custom((value) => {
      if (!value) return true;
      const eventDate = new Date(value);
      const today = new Date();
      
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();

      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();

      const eventDateOnly = new Date(eventYear, eventMonth, eventDay);
      const todayDateOnly = new Date(todayYear, todayMonth, todayDay);

      if (eventDateOnly < todayDateOnly) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),
];
