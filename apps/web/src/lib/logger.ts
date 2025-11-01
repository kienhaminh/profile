type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production, output structured JSON logs
    console.log(JSON.stringify(logData));
  } else {
    // In development, output human-readable logs
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    console.log(prefix, message, context ? context : '');
  }
}

export const logger = {
  info: (message: string, context?: LogContext): void =>
    log('info', message, context),
  warn: (message: string, context?: LogContext): void =>
    log('warn', message, context),
  error: (message: string, context?: LogContext): void =>
    log('error', message, context),
  debug: (message: string, context?: LogContext): void =>
    log('debug', message, context),
};
