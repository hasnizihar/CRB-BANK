import { z } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    const formattedErrors = (error as any).errors.map((e: any) => e.message).join(', ');
    console.error('Validation Error:', formattedErrors);
    return new AppError(`Validation failed: ${formattedErrors}`, 400);
  }

  if (error instanceof AppError) {
    console.error(`[AppError ${error.statusCode}]:`, error.message);
    return error;
  }

  if (error instanceof Error) {
    console.error('[Unhandled Error]:', error.message);
    return new AppError(error.message, 500);
  }

  console.error('[Unknown Error]:', error);
  return new AppError('An unexpected error occurred', 500);
};
