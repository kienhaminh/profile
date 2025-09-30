type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }

  return entry;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLogEntry(entry));
    }
  },

  info(message: string, context?: LogContext): void {
    const entry = createLogEntry('info', message, context);
    console.info(formatLogEntry(entry));
  },

  warn(message: string, context?: LogContext): void {
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLogEntry(entry));
  },

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = createLogEntry('error', message, context, error);
    console.error(formatLogEntry(entry));
  },
};
