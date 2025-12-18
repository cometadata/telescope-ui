import { NextResponse } from "next/server";

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message: string = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function parseIntParam(
  value: string | null,
  defaultValue: number
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseIntClamped(
  value: string | null,
  defaultValue: number,
  min: number,
  max: number
): number {
  const parsed = parseIntParam(value, defaultValue);
  return clamp(parsed, min, max);
}

export function sanitizeString(value: string | null, maxLength: number = 1000): string {
  if (!value) return "";
  return value.slice(0, maxLength).trim();
}

// ROR hashes are alphanumeric, typically 7-9 characters
export function isValidRorHash(ror: string): boolean {
  return /^[a-z0-9]{5,15}$/i.test(ror);
}

export function handleAPIError(error: unknown, context: string): NextResponse {
  console.error(`${context}:`, error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return serverError(`Failed to ${context.toLowerCase()}`);
}
