/**
 * Utility functions for error handling and sanitization
 */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class TechnologyNotFoundError extends NotFoundError {
  constructor(message: string = 'Technology not found') {
    super(message);
    this.name = 'TechnologyNotFoundError';
  }
}

export class TechnologyConflictError extends ConflictError {
  constructor(
    message: string = 'Technology with this name or slug already exists'
  ) {
    super(message);
    this.name = 'TechnologyConflictError';
  }
}

/**
 * Checks if an error represents a database conflict (duplicate key/unique constraint violation)
 * Performs the same tolerant checks as the original inline code but in a reusable function
 */
export function isConflictError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message || '';
  const msg = String(errorMessage);

  // Check error message directly
  if (msg.includes('already exists')) {
    return true;
  }

  if (/duplicate key value|unique constraint/i.test(msg)) {
    return true;
  }

  // Check error cause if it exists
  if (error.cause && typeof error.cause === 'object') {
    const causeMsg =
      'message' in error.cause ? String(error.cause.message) : '';
    const causeCode = 'code' in error.cause ? String(error.cause.code) : '';

    if (/duplicate key value|unique constraint/i.test(causeMsg)) {
      return true;
    }

    if (causeCode === '23505') {
      return true;
    }
  }

  return false;
}

/**
 * Logs error details server-side for debugging while returning sanitized client response
 */
export function logErrorAndReturnSanitized(
  error: unknown,
  context: string,
  conflictMessage = 'Conflict creating topic',
  genericMessage = 'An unexpected error occurred'
): { status: number; body: { error: string; message: string } } {
  // Log full error details for server-side debugging
  console.error(`Error in ${context}:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    cause: error instanceof Error ? error.cause : undefined,
  });

  if (isConflictError(error)) {
    return {
      status: 409,
      body: { error: 'Conflict', message: conflictMessage },
    };
  }

  return {
    status: 500,
    body: { error: 'Internal Server Error', message: genericMessage },
  };
}
