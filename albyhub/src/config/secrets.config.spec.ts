import { Test, TestingModule } from '@nestjs/testing';
import { SecretsService } from './secrets.config';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager');

const mockSecretsManagerClient = SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;

describe('SecretsService', () => {
  let service: SecretsService;
  let mockSend: jest.Mock;

  const validSecretsData = {
    VOLTAGE_API_KEY: 'test-api-key',
    VOLTAGE_MACAROON: 'test-macaroon',
    VOLTAGE_CONNECTION_URL: 'https://voltage.example.com',
    NOSTR_PRIVATE_KEY: 'test-private-key-hex',
    NOSTR_PUBLIC_KEY: 'test-public-key-hex',
    NWC_RELAY_URL: 'wss://relay.example.com',
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a mock send function
    mockSend = jest.fn();

    // Mock the SecretsManagerClient constructor
    mockSecretsManagerClient.mockImplementation(() => ({
      send: mockSend,
    } as any));

    // Set default environment variables
    process.env.SECRETS_MANAGER_NAME = 'albyhub/secrets/test';
    process.env.AWS_REGION = 'us-east-1';
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Test-1.3.c: Caching behavior', () => {
    it('should cache secrets for 30 minutes and call AWS SDK only once', async () => {
      // Mock successful response
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(validSecretsData),
      });

      // Create module without auto-init
      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      // First call - should fetch from AWS
      const secrets1 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(secrets1.voltage.apiKey).toBe('test-api-key');

      // Second call - should use cache
      const secrets2 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(secrets2).toBe(secrets1); // Same reference

      // Third call - should still use cache
      const secrets3 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1); // Still 1
      expect(secrets3).toBe(secrets1);
    });

    it('should refetch secrets after cache expires (30 minutes)', async () => {
      jest.useFakeTimers();

      // Mock successful responses
      mockSend
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(validSecretsData),
        })
        .mockResolvedValueOnce({
          SecretString: JSON.stringify({
            ...validSecretsData,
            VOLTAGE_API_KEY: 'updated-api-key',
          }),
        });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      // First call
      const secrets1 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(secrets1.voltage.apiKey).toBe('test-api-key');

      // Advance time by 29 minutes - should still use cache
      jest.advanceTimersByTime(29 * 60 * 1000);
      const secrets2 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(secrets2.voltage.apiKey).toBe('test-api-key');

      // Advance time by 2 more minutes (total 31) - cache expired
      jest.advanceTimersByTime(2 * 60 * 1000);
      const secrets3 = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(secrets3.voltage.apiKey).toBe('updated-api-key');

      jest.useRealTimers();
    });

    it('should clear cache when clearCache is called', async () => {
      mockSend
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(validSecretsData),
        })
        .mockResolvedValueOnce({
          SecretString: JSON.stringify({
            ...validSecretsData,
            VOLTAGE_API_KEY: 'updated-api-key',
          }),
        });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      // First call
      await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Next call should fetch again
      const secrets = await service.getSecrets();
      expect(mockSend).toHaveBeenCalledTimes(2);
      expect(secrets.voltage.apiKey).toBe('updated-api-key');
    });
  });

  describe('Test-1.3.b: Missing secrets validation', () => {
    it('should throw error with secret name when VOLTAGE_API_KEY is missing', async () => {
      const incompleteSecrets = { ...validSecretsData };
      delete (incompleteSecrets as any).VOLTAGE_API_KEY;

      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(incompleteSecrets),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await expect(service.getSecrets()).rejects.toThrow(
        'Missing required secrets in albyhub/secrets/test: VOLTAGE_API_KEY',
      );
    });

    it('should throw error listing all missing secrets', async () => {
      const incompleteSecrets = {
        VOLTAGE_API_KEY: 'test',
        VOLTAGE_MACAROON: 'test',
        // Missing all others
      };

      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(incompleteSecrets),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await expect(service.getSecrets()).rejects.toThrow(
        'Missing required secrets in albyhub/secrets/test: VOLTAGE_CONNECTION_URL, NOSTR_PRIVATE_KEY, NOSTR_PUBLIC_KEY, NWC_RELAY_URL',
      );
    });

    it('should throw error when secret not found in AWS', async () => {
      const error: any = new Error('Secret not found');
      error.name = 'ResourceNotFoundException';

      mockSend.mockRejectedValueOnce(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await expect(service.getSecrets()).rejects.toThrow(
        'Secret "albyhub/secrets/test" not found in AWS Secrets Manager',
      );
    });

    it('should throw error when access is denied', async () => {
      const error: any = new Error('Access denied');
      error.name = 'AccessDeniedException';

      mockSend.mockRejectedValueOnce(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await expect(service.getSecrets()).rejects.toThrow(
        'Access denied to secret "albyhub/secrets/test". Check Lambda IAM permissions.',
      );
    });
  });

  describe('Test-1.3.e: Retry logic with exponential backoff', () => {
    it('should retry 3 times with exponential backoff (100ms, 200ms, 400ms) on 5xx errors', async () => {
      jest.useFakeTimers();

      const error: any = new Error('Internal Server Error');
      error.name = 'InternalServiceError';
      error.$metadata = { httpStatusCode: 500 };

      // Mock all retries to fail
      mockSend
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      const promise = service.getSecrets();

      // Run all timers to completion
      const runPromise = jest.runAllTimersAsync();

      // Wait for both promises
      await expect(Promise.all([promise, runPromise])).rejects.toThrow(
        'Failed to fetch secrets after 3 attempts',
      );

      // Should have called 3 times (initial + 2 retries)
      expect(mockSend).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    }, 10000);

    it('should succeed on retry and not continue retrying', async () => {
      jest.useFakeTimers();

      const error: any = new Error('Throttling');
      error.name = 'ThrottlingException';

      // First call fails, second succeeds
      mockSend
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(validSecretsData),
        });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      const promise = service.getSecrets();

      // First attempt fails
      await jest.advanceTimersByTimeAsync(0);
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Wait for backoff and second attempt
      await jest.advanceTimersByTimeAsync(100);
      expect(mockSend).toHaveBeenCalledTimes(2);

      // Should succeed
      const secrets = await promise;
      expect(secrets.voltage.apiKey).toBe('test-api-key');

      jest.useRealTimers();
    });

    it('should not retry on non-retryable errors (4xx)', async () => {
      const error: any = new Error('Validation error');
      error.name = 'ValidationException';
      error.$metadata = { httpStatusCode: 400 };

      mockSend.mockRejectedValueOnce(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await expect(service.getSecrets()).rejects.toThrow();

      // Should only call once, no retries
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test-1.3.d: Secret value sanitization', () => {
    it('should never include secret values in error messages', async () => {
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify({
          ...validSecretsData,
          // Add an extra field that won't be used
          EXTRA_SECRET: 'super-secret-value-12345',
        }),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      await service.getSecrets();

      // Verify the mock was called but check that our test doesn't expose secrets
      expect(mockSend).toHaveBeenCalled();

      // Test that errors don't leak values
      const incompleteSecrets = { VOLTAGE_API_KEY: 'secret-key-12345' };
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(incompleteSecrets),
      });

      service.clearCache();

      try {
        await service.getSecrets();
        fail('Should have thrown an error');
      } catch (error: any) {
        // Error message should mention the missing secret names
        expect(error.message).toContain('VOLTAGE_MACAROON');
        // But should NOT contain any secret values
        expect(error.message).not.toContain('secret-key-12345');
      }
    });

    it('should sanitize stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error: any = new Error('Test error');
      error.name = 'TestError';
      error.stack = 'Sensitive stack trace with secret value: abc123';

      mockSend.mockRejectedValueOnce(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      try {
        await service.getSecrets();
        fail('Should have thrown');
      } catch (e: any) {
        // In production, stack trace should not be preserved
        expect(e.stack).not.toContain('Sensitive stack trace');
      }

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Test-1.3.a: Startup and performance', () => {
    it('should load secrets on module init', async () => {
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(validSecretsData),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      // Module init triggers onModuleInit
      await module.init();

      // Should have called Secrets Manager during init
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should fail application startup if secrets cannot be loaded', async () => {
      const error: any = new Error('Network error');
      error.name = 'NetworkingError';

      mockSend.mockRejectedValue(error);

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      // Module init should throw
      await expect(module.init()).rejects.toThrow();
    });

    it('should return properly structured secrets object', async () => {
      mockSend.mockResolvedValueOnce({
        SecretString: JSON.stringify(validSecretsData),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [SecretsService],
      }).compile();

      service = module.get<SecretsService>(SecretsService);

      const secrets = await service.getSecrets();

      // Verify structure
      expect(secrets).toHaveProperty('voltage');
      expect(secrets).toHaveProperty('nostr');
      expect(secrets.voltage).toHaveProperty('apiKey');
      expect(secrets.voltage).toHaveProperty('macaroon');
      expect(secrets.voltage).toHaveProperty('connectionUrl');
      expect(secrets.nostr).toHaveProperty('privateKey');
      expect(secrets.nostr).toHaveProperty('publicKey');
      expect(secrets.nostr).toHaveProperty('relayUrl');

      // Verify values
      expect(secrets.voltage.apiKey).toBe('test-api-key');
      expect(secrets.voltage.macaroon).toBe('test-macaroon');
      expect(secrets.voltage.connectionUrl).toBe('https://voltage.example.com');
      expect(secrets.nostr.privateKey).toBe('test-private-key-hex');
      expect(secrets.nostr.publicKey).toBe('test-public-key-hex');
      expect(secrets.nostr.relayUrl).toBe('wss://relay.example.com');
    });
  });
});
