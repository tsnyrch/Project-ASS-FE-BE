import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import ResponseError from "../utils/ResponseError";

/**
 * Global error handling middleware that catches and processes all errors
 * thrown during request handling.
 */
export const errorHandler: ErrorRequestHandler = (
  err: ResponseError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Convert standard errors to ResponseError
  const responseError =
    err instanceof ResponseError
      ? err
      : new ResponseError(err.message || "Internal Server Error");

  // Set default status code if not provided
  if (!responseError.statusCode) {
    responseError.statusCode = 500;
  }

  // Log the error details
  console.error(
    `[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`
  );
  console.error(
    `Status: ${responseError.statusCode}, Message: ${responseError.message}`
  );

  if (responseError.statusCode >= 500) {
    console.error(`Stack: ${responseError.stack}`);
  }

  // Set response status code
  res.status(responseError.statusCode);

  // Send appropriate response
  if (responseError.message) {
    res.json({
      code: responseError.statusCode,
      message: responseError.message,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Fallback for empty messages
    res.json({
      code: responseError.statusCode,
      message: "An error occurred",
      stack:
        process.env.NODE_ENV === "production" ? undefined : responseError.stack,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }
};
