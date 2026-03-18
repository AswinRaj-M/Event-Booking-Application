import { AppError } from "../utils/AppError.js";


export const globalErrorHandler = (err, req, res, next) => {
  console.error("ERROR 💥:", err);

  let statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  let status = err.status || 'error';

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      status,
      message: err.message,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    return res.status(400).json({ status: 'fail', message });
  }

  const response = {
    status: 'error',
    message: err.message || "Something went very wrong! Please try again later.",
  };

  if (process.env.NODE_ENV === "development") {
    response.error = err;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};



