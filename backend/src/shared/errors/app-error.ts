export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "VALIDATION_ERROR") {
    super(message, code, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code = "NOT_FOUND") {
    super(message, code, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT") {
    super(message, code, 409);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, code = "EXTERNAL_SERVICE_ERROR") {
    super(message, code, 502);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, code = "TIMEOUT") {
    super(message, code, 504);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, code = "INTERNAL_SERVER_ERROR") {
    super(message, code, 500);
  }
}
