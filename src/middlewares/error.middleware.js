import { ApiError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

/**
 * Global Error Handler Middleware
 * Catch all unhandled errors, format them, and send a consistent JSON response avoiding app crashes.
 */
export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Check if the error is an instance of our custom ApiError class.
    // If not, we wrap it in a generic 500 error.
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        ...error,
        message: error.message,
        // Only include stack trace if we are in development mode
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
    };

    // Log the error using our professional logger
    logger.error(`${error.message} - ${req.method} ${req.url} - ${req.ip}`);

    // Finally send it back to the client
    return res.status(error.statusCode).json(response);
};
