import { HealthService } from './health.service';
import { HealthCheckService } from '@nestjs/terminus';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { VoltageHealthIndicator } from './indicators/voltage.health';
import { SecretsHealthIndicator } from './indicators/secrets.health';

describe('HealthService', () => {
  let service: HealthService;
  let mockHealthCheckService: HealthCheckService;
  let memoryIndicator: MemoryHealthIndicator;
  let voltageIndicator: VoltageHealthIndicator;
  let secretsIndicator: SecretsHealthIndicator;

  beforeEach(() => {
    memoryIndicator = new MemoryHealthIndicator();
    voltageIndicator = new VoltageHealthIndicator();
    secretsIndicator = new SecretsHealthIndicator();

    mockHealthCheckService = {
      check: jest.fn().mockResolvedValue({
        status: 'up',
        details: {
          memory: { status: 'up' },
          voltage: { status: 'up' },
          secrets: { status: 'up' },
        },
      }),
    } as any;

    service = new HealthService(
      mockHealthCheckService,
      {} as any,
      memoryIndicator,
      voltageIndicator,
      secretsIndicator,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check (liveness)', () => {
    it('should return status ok', () => {
      const result = service.check();
      expect(result.status).toBe('ok');
    });

    it('should return a valid ISO timestamp', () => {
      const result = service.check();
      expect(result.timestamp).toBeDefined();
      expect(() => new Date(result.timestamp)).not.toThrow();
    });

    it('should return environment from process.env or default', () => {
      const result = service.check();
      expect(result.environment).toBeDefined();
      expect(typeof result.environment).toBe('string');
    });

    it('should return version from process.env or default', () => {
      const result = service.check();
      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
    });

    it('should return all required fields', () => {
      const result = service.check();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('version');
    });
  });

  describe('checkReady (readiness)', () => {
    it('should call health check service', async () => {
      process.env.ALBY_HUB_URL = 'https://api.alby.com';
      process.env.ALBY_HUB_CLIENT_ID = 'test-id';
      process.env.ALBY_HUB_CLIENT_SECRET = 'test-secret';
      process.env.VOLTAGE_API_URL = 'https://api.voltage.cloud';

      await service.checkReady();
      expect(mockHealthCheckService.check).toHaveBeenCalled();
    });

    it('should return a health check result', async () => {
      process.env.ALBY_HUB_URL = 'https://api.alby.com';
      process.env.ALBY_HUB_CLIENT_ID = 'test-id';
      process.env.ALBY_HUB_CLIENT_SECRET = 'test-secret';
      process.env.VOLTAGE_API_URL = 'https://api.voltage.cloud';

      const result = await service.checkReady();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
    });
  });
});
