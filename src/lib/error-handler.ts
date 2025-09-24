import { NextRequest, NextResponse } from 'next/server';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(field ? `${field}: ${message}` : message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

export function handleError(error: any): NextResponse {
  console.error('Error:', error);

  // Handle known application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      },
      { status: error.statusCode }
    );
  }

  // Handle Supabase errors
  if (error?.code && error?.message) {
    const statusCode = getSupabaseErrorStatusCode(error.code);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        statusCode,
      },
      { status: statusCode }
    );
  }

  // Handle validation errors (Zod)
  if (error?.issues) {
    const validationErrors = error.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        validationErrors,
        statusCode: 400,
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  return NextResponse.json(
    {
      success: false,
      error: 'Internal server error',
      statusCode: 500,
    },
    { status: 500 }
  );
}

function getSupabaseErrorStatusCode(errorCode: string): number {
  switch (errorCode) {
    case 'PGRST116': // Row not found
      return 404;
    case '23505': // Unique violation
      return 409;
    case '23503': // Foreign key violation
      return 400;
    case '23502': // Not null violation
      return 400;
    case '23514': // Check constraint violation
      return 400;
    default:
      return 500;
  }
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

export function logError(error: any, context?: any): void {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context,
  };

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2));
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function createErrorResponse(error: string, statusCode: number = 500): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    statusCode,
  }, { status: statusCode });
}
