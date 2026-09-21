export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class PermissionError extends AppError {
  constructor(action: string) {
    super("PERMISSION_DENIED", `You do not have permission to perform: ${action}`, 403);
    this.name = "PermissionError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super("NOT_FOUND", id ? `${entity} not found: ${id}` : `${entity} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super("VALIDATION_ERROR", message, 422);
    this.name = "ValidationError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHENTICATED", message, 401);
    this.name = "AuthError";
  }
}

export class PlatformError extends AppError {
  constructor(
    platform: string,
    message: string,
    public readonly retryable: boolean,
    public readonly platformCode?: string,
  ) {
    super("PLATFORM_ERROR", `[${platform}] ${message}`, 502);
    this.name = "PlatformError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}

export function toApiError(error: unknown): { code: string; message: string; status: number } {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message, status: error.status };
  }
  console.error("Unexpected error:", error);
  return { code: "INTERNAL_ERROR", message: "An unexpected error occurred", status: 500 };
}
