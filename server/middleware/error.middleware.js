import { AppError } from "../utils/AppError.js";


export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  let status = statusCode >= 500 ? 'error' : 'fail';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;

    const response = {
      status,
      message: err.message,
    };

    if (process.env.NODE_ENV === 'development') {
      response.error = err;
      response.stack = err.stack;
    }

    return res.status(statusCode).json(response);
  }



  const response = {
    status: 'error',
    message: 'Something went very wrong! Please try again later.',
  };

  if (process.env.NODE_ENV === 'development') {
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



