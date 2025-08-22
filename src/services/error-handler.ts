import type { AppError } from "../types";

export class ErrorHandler {
  static createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details,
    };
  }

  static handleError(error: unknown, context: string): AppError {
    console.error(`Error in ${context}:`, error);

    if (error instanceof Error) {
      return this.createError("UNKNOWN_ERROR", error.message, {
        context,
        stack: error.stack,
      });
    }

    if (typeof error === "string") {
      return this.createError("STRING_ERROR", error, { context });
    }

    return this.createError("UNKNOWN_ERROR", "An unknown error occurred", {
      context,
      originalError: error,
    });
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("HTTP") ||
        error.message.includes("timeout")
      );
    }
    return false;
  }

  static isApiError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === "ApiError" ||
        error.message.includes("API") ||
        error.message.includes("HTTP")
      );
    }
    return false;
  }

  static isStorageError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === "StorageError" ||
        error.message.includes("storage") ||
        error.message.includes("chrome.storage")
      );
    }
    return false;
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (typeof error === "object" && error !== null) {
      const appError = error as AppError;
      if (appError.message) {
        return appError.message;
      }
    }

    return "An unknown error occurred";
  }

  static getErrorCode(error: unknown): string {
    if (typeof error === "object" && error !== null) {
      const appError = error as AppError;
      if (appError.code) {
        return appError.code;
      }
    }

    if (this.isNetworkError(error)) {
      return "NETWORK_ERROR";
    }

    if (this.isApiError(error)) {
      return "API_ERROR";
    }

    if (this.isStorageError(error)) {
      return "STORAGE_ERROR";
    }

    return "UNKNOWN_ERROR";
  }

  // Utility methods for common error scenarios
  static createNetworkError(message: string): AppError {
    return this.createError("NETWORK_ERROR", message);
  }

  static createApiError(message: string, status?: number): AppError {
    return this.createError("API_ERROR", message, { status });
  }

  static createStorageError(message: string): AppError {
    return this.createError("STORAGE_ERROR", message);
  }

  static createValidationError(message: string): AppError {
    return this.createError("VALIDATION_ERROR", message);
  }

  static createInitializationError(message: string): AppError {
    return this.createError("INITIALIZATION_ERROR", message);
  }
}
