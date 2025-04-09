/**
 * Enum representing the possible states of a service operation
 */
export enum ResponseStatus {
  /** The operation is still in progress */
  LOADING = "LOADING",

  /** The operation completed successfully */
  SUCCESS = "SUCCESS",

  /** The operation failed */
  ERROR = "ERROR",
}

/**
 * Type representing a response from a service operation
 * Uses a discriminated union pattern for type safety
 */
export type ServiceResponse<T> =
  | { status: ResponseStatus.LOADING; timestamp?: Date }
  | { status: ResponseStatus.SUCCESS; data: T; timestamp?: Date }
  | { status: ResponseStatus.ERROR; error: string; timestamp?: Date };

/**
 * Create a loading response
 */
export function createLoadingResponse<T>(): ServiceResponse<T> {
  return {
    status: ResponseStatus.LOADING,
    timestamp: new Date(),
  };
}

/**
 * Create a success response with data
 */
export function createSuccessResponse<T>(data: T): ServiceResponse<T> {
  return {
    status: ResponseStatus.SUCCESS,
    data,
    timestamp: new Date(),
  };
}

/**
 * Create an error response with an error message
 */
export function createErrorResponse<T>(error: string): ServiceResponse<T> {
  return {
    status: ResponseStatus.ERROR,
    error,
    timestamp: new Date(),
  };
}
