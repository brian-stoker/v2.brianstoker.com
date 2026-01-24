import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import { randomUUID } from 'crypto';

export interface LogContext {
  requestId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService extends Logger {
  private winstonLogger!: winston.Logger;
  private requestIdMap = new Map<string, string>();

  constructor() {
    super();
    this.initializeWinston();
  }

  private initializeWinston(): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      transports: [
        new winston.transports.Console({
          format: isDevelopment
            ? winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
                  return `[${timestamp}] ${level}: ${message} ${metaStr}`;
                }),
              )
            : winston.format.json(),
        }),
      ],
    });
  }

  setRequestId(requestId: string): void {
    const contextId = (global as any).contextId || 'default';
    this.requestIdMap.set(contextId, requestId);
  }

  getRequestId(): string {
    const contextId = (global as any).contextId || 'default';
    return this.requestIdMap.get(contextId) || randomUUID();
  }

  log(message: string, context?: string, meta?: LogContext): void {
    const requestId = this.getRequestId();
    const logMeta = {
      ...meta,
      requestId,
      context,
    };

    super.log(message, context);
    this.winstonLogger.info(message, logMeta);
  }

  error(message: string, trace?: string, context?: string, meta?: LogContext): void {
    const requestId = this.getRequestId();
    const logMeta = {
      ...meta,
      requestId,
      context,
      trace,
    };

    super.error(message, trace, context);
    this.winstonLogger.error(message, logMeta);
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    const requestId = this.getRequestId();
    const logMeta = {
      ...meta,
      requestId,
      context,
    };

    super.warn(message, context);
    this.winstonLogger.warn(message, logMeta);
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    const requestId = this.getRequestId();
    const logMeta = {
      ...meta,
      requestId,
      context,
    };

    super.debug(message, context);
    this.winstonLogger.debug(message, logMeta);
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    const requestId = this.getRequestId();
    const logMeta = {
      ...meta,
      requestId,
      context,
    };

    this.winstonLogger.debug(message, logMeta);
  }
}
