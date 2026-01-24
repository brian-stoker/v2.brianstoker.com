import { Test, TestingModule } from '@nestjs/testing';
import { SecretsHealthIndicator } from './secrets.health';
import { HealthCheckError } from '@nestjs/terminus';

describe('SecretsHealthIndicator', () => {
  let indicator: SecretsHealthIndicator;
  const originalEnv = process.env;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecretsHealthIndicator],
    }).compile();

    indicator = module.get<SecretsHealthIndicator>(SecretsHealthIndicator);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('check', () => {
    it('should return secrets status', async () => {
      process.env.ALBY_HUB_URL = 'https://api.alby.com';
      process.env.ALBY_HUB_CLIENT_ID = 'test-id';
      process.env.ALBY_HUB_CLIENT_SECRET = 'test-secret';

      const result = await indicator.check('secrets');
      expect(result).toHaveProperty('secrets');
      expect(result.secrets).toHaveProperty('status');
      expect(result.secrets).toHaveProperty('missingSecrets');
    });

    it('should return up status when all secrets are present', async () => {
      process.env.ALBY_HUB_URL = 'https://api.alby.com';
      process.env.ALBY_HUB_CLIENT_ID = 'test-id';
      process.env.ALBY_HUB_CLIENT_SECRET = 'test-secret';

      const result = await indicator.check('secrets');
      expect(result.secrets.status).toBe('up');
      expect(result.secrets.missingSecrets).toEqual([]);
    });

    it('should return down status when secrets are missing', async () => {
      delete process.env.ALBY_HUB_URL;
      delete process.env.ALBY_HUB_CLIENT_ID;
      delete process.env.ALBY_HUB_CLIENT_SECRET;

      try {
        await indicator.check('secrets');
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
      }
    });

    it('should list missing secrets', async () => {
      delete process.env.ALBY_HUB_URL;
      process.env.ALBY_HUB_CLIENT_ID = 'test-id';
      process.env.ALBY_HUB_CLIENT_SECRET = 'test-secret';

      try {
        await indicator.check('secrets');
        fail('Should have thrown HealthCheckError');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
      }
    });
  });
});
