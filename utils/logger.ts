// utils/logger.ts
// Simple structured logger used by client and functions.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function format(level: LogLevel, message: string, meta?: Record<string, any>) {
  const out = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  return JSON.stringify(out);
}

export const logger = {
  debug: (message: string, meta?: Record<string, any>) => console.debug(format('debug', message, meta)),
  info: (message: string, meta?: Record<string, any>) => console.info(format('info', message, meta)),
  warn: (message: string, meta?: Record<string, any>) => console.warn(format('warn', message, meta)),
  error: (message: string, meta?: Record<string, any>) => console.error(format('error', message, meta)),
};
