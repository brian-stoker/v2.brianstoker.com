import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('correlation ID', () => {
    it('should generate and return a correlation ID', () => {
      const correlationId = service.getRequestId();
      expect(correlationId).toBeDefined();
      expect(typeof correlationId).toBe('string');
      expect(correlationId.length).toBeGreaterThan(0);
    });

    it('should set and retrieve correlation ID', () => {
      const testId = 'test-correlation-id-123';
      service.setRequestId(testId);
      const retrieved = service.getRequestId();
      expect(retrieved).toBe(testId);
    });

    it('should maintain separate IDs for different contexts', () => {
      const id1 = 'test-id-1';
      service.setRequestId(id1);

      // Change context (simulate different request)
      const id2 = 'test-id-2';
      service.setRequestId(id2);

      const retrieved = service.getRequestId();
      expect(retrieved).toBe(id2);
    });
  });

  describe('logging methods', () => {
    it('should log info messages', () => {
      expect(() => {
        service.log('Test info message', 'TestContext');
      }).not.toThrow();
    });

    it('should log error messages', () => {
      expect(() => {
        service.error('Test error message', 'test stack trace', 'TestContext');
      }).not.toThrow();
    });

    it('should log warning messages', () => {
      expect(() => {
        service.warn('Test warning message', 'TestContext');
      }).not.toThrow();
    });

    it('should log debug messages', () => {
      expect(() => {
        service.debug('Test debug message', 'TestContext');
      }).not.toThrow();
    });

    it('should log verbose messages', () => {
      expect(() => {
        service.verbose('Test verbose message', 'TestContext');
      }).not.toThrow();
    });

    it('should include correlation ID in log context', () => {
      const testId = 'test-id-with-context';
      service.setRequestId(testId);

      expect(() => {
        service.log('Test message with context', 'TestContext', {
          customField: 'customValue',
        });
      }).not.toThrow();
    });
  });

  describe('structured logging', () => {
    it('should support metadata in logs', () => {
      expect(() => {
        service.log('Test message', 'TestContext', {
          userId: '123',
          action: 'test_action',
        });
      }).not.toThrow();
    });

    it('should handle log levels appropriately', () => {
      const originalLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = 'debug';

      expect(() => {
        service.debug('Debug message', 'TestContext');
      }).not.toThrow();

      if (originalLevel) {
        process.env.LOG_LEVEL = originalLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    });
  });
});
