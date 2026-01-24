import { Test, TestingModule } from '@nestjs/testing';
import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { LoggerService } from './logger.service';
import { Request, Response } from 'express';

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let logger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    logger = module.get<LoggerService>(LoggerService);
    middleware = new CorrelationIdMiddleware(logger);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should generate correlation ID if not provided', () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((res as any).setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        expect.any(String),
      );
      expect((req as any).correlationId).toBeDefined();
    });

    it('should use provided correlation ID from header', () => {
      const testId = 'test-correlation-id-123';
      const req = {
        headers: {
          'x-correlation-id': testId,
        },
      } as unknown as Request;

      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((res as any).setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        testId,
      );
      expect((req as any).correlationId).toBe(testId);
    });

    it('should set correlation ID in response header', () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware.use(req, res, next);

      expect((res as any).setHeader).toHaveBeenCalledWith(
        'x-correlation-id',
        expect.any(String),
      );
    });

    it('should call logger.setRequestId with correlation ID', () => {
      const testId = 'test-id-123';
      const req = {
        headers: {
          'x-correlation-id': testId,
        },
      } as unknown as Request;

      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      const setRequestIdSpy = jest.spyOn(logger, 'setRequestId');

      middleware.use(req, res, next);

      expect(setRequestIdSpy).toHaveBeenCalledWith(testId);
      setRequestIdSpy.mockRestore();
    });

    it('should call next function', () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const res = {
        setHeader: jest.fn(),
      } as unknown as Response;

      const next = jest.fn();

      middleware.use(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
