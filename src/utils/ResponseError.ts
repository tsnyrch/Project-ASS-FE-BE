/**
 * Custom error class for HTTP response errors with status codes
 * Extends the standard Error class with additional fields for API responses
 */
export default class ResponseError extends Error {
  statusCode: number;
  details?: Record<string, any>;

  /**
   * Creates a new ResponseError instance
   *
   * @param message Error message to be sent in the response
   * @param statusCode HTTP status code (defaults to 400 Bad Request)
   * @param details Additional error details for debugging or client info
   */
  constructor(
    message: string,
    statusCode: number = 400,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "ResponseError";
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}
