import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SecretsService } from '../src/config/secrets.config';
import { ConfigModule } from '../src/config/config.module';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager');

const mockSecretsManagerClient = SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;

describe('Secrets Integration (e2e)', () => {
  let app: INestApplication;
  let secretsService: SecretsService;
  let mockSend: jest.Mock;

  const validSecretsData = {
    VOLTAGE_API_KEY: 'test-api-key',
    VOLTAGE_MACAROON: 'test-macaroon',
    VOLTAGE_CONNECTION_URL: 'https://voltage.example.com',
    NOSTR_PRIVATE_KEY: 'test-private-key-hex',
    NOSTR_PUBLIC_KEY: 'test-public-key-hex',
    NWC_RELAY_URL: 'wss://relay.example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend = jest.fn();

    mockSecretsManagerClient.mockImplementation(() => ({
      send: mockSend,
    } as any));

    process.env.SECRETS_MANAGER_NAME = 'albyhub/secrets/test';
    process.env.AWS_REGION = 'us-east-1';
  });

  describe('Test-1.3.a: Application startup with secrets loading', () => {
    it('should start application successfully with secrets loaded in <2s', async () => {
      // Mock successful secret fetch with slight delay to simulate network
      mockSend.mockImplementation(() =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              SecretString: JSON.stringify(validSecretsData),
            });
          }, 50); // 50ms delay to simulate network
        }),
      );

      const startTime = Date.now();

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      const duration = Date.now() - startTime;

      // Should complete in under 2 seconds
      expect(duration).toBeLessThan(2000);

      secretsService = app.get<SecretsService>(SecretsService);

      // Verify secrets are accessible
      const secrets = await secretsService.getSecrets();
      expect(secrets.voltage.apiKey).toBe('test-api-key');

      // Should use cache, not call AWS again
      expect(mockSend).toHaveBeenCalledTimes(1);

      await app.close();
    });

    it('should fail fast on startup when secrets are missing', async () => {
      const incompleteSecrets = {
        VOLTAGE_API_KEY: 'test',
        // Missing all other required secrets
      };

      mockSend.mockResolvedValue({
        SecretString: JSON.stringify(incompleteSecrets),
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      // Should throw during initialization
      await expect(app.init()).rejects.toThrow();

      await app.close();
    });
  });

  describe('Test-1.3.b: Missing secret error messages', () => {
    it('should provide clear error message identifying missing secret name', async () => {
      const incompleteSecrets = { ...validSecretsData };
      delete (incompleteSecrets as any).NOSTR_PRIVATE_KEY;

      mockSend.mockResolvedValue({
        SecretString: JSON.stringify(incompleteSecrets),
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      try {
        await app.init();
        fail('Should have thrown an error');
      } catch (error: any) {
        // Error should contain the secret name
        expect(error.message).toContain('NOSTR_PRIVATE_KEY');
        // Error should contain the secret manager name
        expect(error.message).toContain('albyhub/secrets/test');
        // Should be clear about what's missing
        expect(error.message).toContain('Missing required secrets');
      }

      await app.close();
    });
  });

  describe('Test-1.3.c: Caching within TTL window', () => {
    it('should use cached secrets without additional AWS API calls within 30min TTL', async () => {
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify(validSecretsData),
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      secretsService = app.get<SecretsService>(SecretsService);

      // First call during init
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Multiple subsequent calls should use cache
      await secretsService.getSecrets();
      await secretsService.getSecrets();
      await secretsService.getSecrets();

      // Still only called once
      expect(mockSend).toHaveBeenCalledTimes(1);

      await app.close();
    });
  });

  describe('Test-1.3.d: Secret value never appears in logs or errors', () => {
    it('should not expose secret values in error responses', async () => {
      const secretsWithSensitiveValue = {
        VOLTAGE_API_KEY: 'super-secret-api-key-12345',
        VOLTAGE_MACAROON: 'macaroon-value',
        // Missing other required fields to trigger error
      };

      mockSend.mockResolvedValue({
        SecretString: JSON.stringify(secretsWithSensitiveValue),
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      try {
        await app.init();
        fail('Should have thrown an error');
      } catch (error: any) {
        const errorMessage = error.message;

        // Error should mention missing fields
        expect(errorMessage).toContain('Missing required secrets');

        // But should NOT expose any secret values
        expect(errorMessage).not.toContain('super-secret-api-key-12345');
        expect(errorMessage).not.toContain('macaroon-value');

        // Should only contain secret key names
        expect(errorMessage).toMatch(/VOLTAGE_CONNECTION_URL|NOSTR_PRIVATE_KEY/);
      }

      await app.close();
    });

    it('should sanitize AWS SDK errors to not leak secret data', async () => {
      // Simulate an error that might contain secret name in message
      const error: any = new Error('Failed to get secret: albyhub/secrets/test');
      error.name = 'ResourceNotFoundException';

      mockSend.mockRejectedValue(error);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      try {
        await app.init();
        fail('Should have thrown');
      } catch (e: any) {
        // Should have sanitized error message
        expect(e.message).toContain('not found in AWS Secrets Manager');
        expect(e.message).toContain('albyhub/secrets/test');
      }

      await app.close();
    });
  });

  describe('Test-1.3.e: Retry with exponential backoff', () => {
    it('should retry 3 times with exponential backoff when Secrets Manager returns 500', async () => {
      jest.useFakeTimers();

      const error: any = new Error('Internal Server Error');
      error.name = 'InternalServiceError';
      error.$metadata = { httpStatusCode: 500 };

      // First 3 attempts fail, 4th succeeds
      mockSend
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(validSecretsData),
        });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      const initPromise = app.init();

      // First attempt
      await jest.advanceTimersByTimeAsync(0);
      expect(mockSend).toHaveBeenCalledTimes(1);

      // First retry after 100ms backoff
      await jest.advanceTimersByTimeAsync(100);
      expect(mockSend).toHaveBeenCalledTimes(2);

      // Second retry after 200ms backoff
      await jest.advanceTimersByTimeAsync(200);
      expect(mockSend).toHaveBeenCalledTimes(3);

      // Should succeed now
      await initPromise;

      secretsService = app.get<SecretsService>(SecretsService);
      const secrets = await secretsService.getSecrets();
      expect(secrets.voltage.apiKey).toBe('test-api-key');

      jest.useRealTimers();
      await app.close();
    });

    it('should fail after 3 retries if all attempts fail', async () => {
      jest.useFakeTimers();

      const error: any = new Error('Service Unavailable');
      error.name = 'ServiceUnavailable';
      error.$metadata = { httpStatusCode: 503 };

      mockSend.mockRejectedValue(error);

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule],
      }).compile();

      app = moduleFixture.createNestApplication();

      const initPromise = app.init();
      const runTimersPromise = jest.runAllTimersAsync();

      await expect(Promise.all([initPromise, runTimersPromise])).rejects.toThrow(
        'Failed to fetch secrets after 3 attempts',
      );

      expect(mockSend).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
      await app.close();
    }, 10000);
  });
});
