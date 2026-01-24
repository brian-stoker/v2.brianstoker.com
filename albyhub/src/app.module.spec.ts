// Set environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.SECRETS_MANAGER_NAME = 'albyhub/secrets/test';
process.env.AWS_REGION = 'us-east-1';

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from './config/config.module';
import { SecretsService } from './config/secrets.config';

// Mock AWS SDK
jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    SecretsManagerClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({
        SecretString: JSON.stringify({
          VOLTAGE_API_KEY: 'test-api-key',
          VOLTAGE_MACAROON: 'test-macaroon',
          VOLTAGE_CONNECTION_URL: 'https://voltage.example.com',
          NOSTR_PRIVATE_KEY: 'test-private-key',
          NOSTR_PUBLIC_KEY: 'test-public-key',
          NWC_RELAY_URL: 'wss://relay.example.com',
        }),
      }),
    })),
    GetSecretValueCommand: jest.fn(),
  };
});

describe('AppModule', () => {
  describe('Test-1.1.a: AppModule bootstraps successfully with valid configuration', () => {
    it('should compile the module with valid environment variables', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      expect(module).toBeDefined();
      expect(module.get(ConfigModule)).toBeDefined();
    });

    it('should load configuration from environment and secrets', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();

      const secretsService = module.get(SecretsService);
      expect(secretsService).toBeDefined();
    });
  });
});
