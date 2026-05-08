import type { ErrorRequestHandler } from "express";
import { ApplicationError } from "../../application/errors/ApplicationError";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ApplicationError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  response.status(500).json({
    success: false,
    error: {
      message: "Internal server error.",
    },
  });
};

