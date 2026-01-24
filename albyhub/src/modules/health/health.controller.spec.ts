import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    // Mock HealthService
    const mockHealthService = {
      check: jest.fn().mockReturnValue({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: 'test',
        version: '1.0.0',
      }),
      checkReady: jest.fn().mockResolvedValue({
        status: 'up',
        details: {
          memory: { status: 'up' },
          voltage: { status: 'up' },
          secrets: { status: 'up' },
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check (liveness)', () => {
    it('should return health status in less than 100ms', (done) => {
      const start = Date.now();
      const result = controller.check();
      const duration = Date.now() - start;

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('version');
      expect(duration).toBeLessThan(100);
      done();
    });

    it('should return current timestamp', () => {
      const beforeCall = new Date(Date.now() - 10); // Give 10ms buffer
      const result = controller.check();
      const afterCall = new Date(Date.now() + 10); // Give 10ms buffer

      const timestamp = new Date(result.timestamp);
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should call health service check method', () => {
      controller.check();
      expect(service.check).toHaveBeenCalled();
    });
  });

  describe('checkReady (readiness)', () => {
    it('should be defined', () => {
      expect(controller.checkReady).toBeDefined();
    });

    it('should return health check result', async () => {
      const result = await controller.checkReady();
      expect(result).toHaveProperty('status');
      expect(['up', 'down']).toContain(result.status);
    });

    it('should call health service checkReady method', async () => {
      await controller.checkReady();
      expect(service.checkReady).toHaveBeenCalled();
    });
  });
});
