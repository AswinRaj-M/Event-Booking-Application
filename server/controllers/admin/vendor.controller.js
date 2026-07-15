import { sendMail } from "../../utils/sendMail.js";
import { HTTP_STATUS } from "../../utils/enums/http.status.enum.js";

import {
  getAllVendorsService,
  getVendorByIdService,
  vendorApproveService,
  vendorRejectService,
  vendorSuspendService,
  vendorUnsuspendService,
} from "../../services/admin/vendor.service.js";

export const getAllVendors = async (req, res) => {
  const { status, page = 1, limit = 4, search, category } = req.query;

  const result = await getAllVendorsService(status, page, limit, search, category)

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    ...result,
  });
};


export const getVendorById = async (req, res) => {
  const id = req.params.id;

  const vendor = await getVendorByIdService(id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: vendor,
  });
};


export const vendorApprove = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorApproveService(id);

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Vendor Application Approved!"
    );
  } catch (err) {
    console.error("Error sending approval email:", err.message);
  }

  return res.status(HTTP_STATUS.OK).json({
    message: "Application Approved",
  });
};


export const vendorReject = async (req, res) => {
  const { id, message } = req.body;

  const vendor = await vendorRejectService(id, message);

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Vendor Application rejected!"
    );
  } catch (err) {
    console.error("Error sending rejection email:", err.message);
  }

  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message: "Application Rejected!",
  });
};

export const vendorSuspend = async(req,res) =>{
  const {id,message} = req.body

  const vendor = await vendorSuspendService(id,message)

  try {
    await sendMail(
      vendor.businessEmail,
      message, 
      "You have been suspended"
    );
  } catch (err) {
    console.error("Error sending suspension email:", err.message);
  }

  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : "Vendor suspended Successfully!"
  })

}

export const vendorUnsuspend = async(req,res) =>{
  const {id,message} = req.body

  const vendor = await vendorUnsuspendService(id)

  try {
    await sendMail(
      vendor.businessEmail,
      message,
      "Suspension Lifted"
    );
  } catch (err) {
    console.error("Error sending unsuspension email:", err.message);
  }

  return res.status(HTTP_STATUS.OK).json({
    success : true,
    message : "Vendor unsuspended Successfully!"
  })

}

export const VendorSendEmail = async (req, res) => {
  const { businessEmail, message } = req.body;
  try {
    await sendMail(
      businessEmail,
      message,
      "Message From Festivo Admin!"
    );
  } catch (err) {
    console.error("Error sending email to vendor:", err.message);
  }

  return res.status(HTTP_STATUS.OK).json({
    message: "Message send Successfully"
  })
}
