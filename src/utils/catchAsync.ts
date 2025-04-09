import { Request, Response, NextFunction } from "express";

/**
 * A higher-order function that wraps async route handlers to automatically catch errors
 * and forward them to the error handling middleware.
 *
 * @param fn The async route handler function to wrap
 * @returns A function that calls the original handler and catches any errors
 */
export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error for debugging but let the error handler middleware format the response
      console.error(`Error caught in catchAsync: ${error.message}`);
      next(error);
    });
  };
}
