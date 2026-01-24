import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { LoggerService } from './logger.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Get correlation ID from request header or generate new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Store correlation ID in request object for access in handlers
    (req as any).correlationId = correlationId;

    // Set correlation ID for this request's context
    this.logger.setRequestId(correlationId);

    // Set correlation ID in response header
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
