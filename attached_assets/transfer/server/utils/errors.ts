// Error handling utilities

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function formatErrorResponse(error: unknown) {
  if (isApiError(error)) {
    return {
      success: false,
      error: {
        code: error.name,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode
      }
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      statusCode: 500
    }
  };
}