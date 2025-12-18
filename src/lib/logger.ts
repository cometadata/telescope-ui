type LogLevel = "info" | "warn" | "error";

interface LogEvent {
  event: string;
  level: LogLevel;
  timestamp: string;
  [key: string]: unknown;
}

export function log(
  event: string,
  level: LogLevel,
  data: Record<string, unknown> = {}
): void {
  const logEvent: LogEvent = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // In production, this goes to Vercel's log drain
  // In development, format for readability
  if (process.env.NODE_ENV === "development") {
    console.log(`[${level.toUpperCase()}] ${event}`, data);
  } else {
    console.log(JSON.stringify(logEvent));
  }
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => log(event, "info", data),
  warn: (event: string, data?: Record<string, unknown>) => log(event, "warn", data),
  error: (event: string, data?: Record<string, unknown>) => log(event, "error", data),
};
