import { logger } from './logger';
import { NextResponse } from 'next/server';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export function handleServiceError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('An unexpected error occurred');
}

/**
 * Logs an error and returns a sanitized error response
 */
export function logErrorAndReturnSanitized(
  error: unknown,
  context: string
): NextResponse {
  if (error instanceof Error) {
    logger.error(`${context}: ${error.message}`, { error, context });
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }

  logger.error(`${context}: Unknown error`, { error, context });
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// Entity-specific error classes for backward compatibility
export class ProjectNotFoundError extends NotFoundError {}
export class ProjectConflictError extends ConflictError {}
export class BlogNotFoundError extends NotFoundError {}
export class BlogConflictError extends ConflictError {}
