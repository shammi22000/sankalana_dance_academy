export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(details: Record<string, string>) {
    super("Validation failed.", 400, details);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "Invalid credentials.") {
    super(message, 401);
  }
}
