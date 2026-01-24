import { Test, TestingModule } from '@nestjs/testing';
import { VoltageHealthIndicator } from './voltage.health';
import { HealthCheckError } from '@nestjs/terminus';

describe('VoltageHealthIndicator', () => {
  let indicator: VoltageHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoltageHealthIndicator],
    }).compile();

    indicator = module.get<VoltageHealthIndicator>(VoltageHealthIndicator);
  });

  afterEach(() => {
    delete process.env.VOLTAGE_API_URL;
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('check', () => {
    it('should return voltage status when API URL is configured', async () => {
      process.env.VOLTAGE_API_URL = 'https://api.voltage.cloud';
      const result = await indicator.check('voltage');
      expect(result).toHaveProperty('voltage');
      expect(result.voltage).toHaveProperty('status');
      expect(['up', 'down']).toContain(result.voltage.status);
    });

    it('should return down status when API URL is not configured', async () => {
      try {
        await indicator.check('voltage');
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
      }
    });

    it('should return up status when API is healthy', async () => {
      process.env.VOLTAGE_API_URL = 'https://api.voltage.cloud';
      const result = await indicator.check('voltage');
      expect(result.voltage.status).toBe('up');
    });
  });
});
