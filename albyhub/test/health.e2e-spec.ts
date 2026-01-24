import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager');

const mockSecretsManagerClient =
  SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;

describe('Health (e2e)', () => {
  let app: INestApplication;
  let mockSend: jest.Mock;

  const validSecretsData = {
    VOLTAGE_API_KEY: 'test-api-key',
    VOLTAGE_MACAROON: 'test-macaroon',
    VOLTAGE_CONNECTION_URL: 'https://voltage.example.com',
    NOSTR_PRIVATE_KEY: 'test-private-key-hex',
    NOSTR_PUBLIC_KEY: 'test-public-key-hex',
    NWC_RELAY_URL: 'wss://relay.example.com',
  };

  beforeAll(async () => {
    jest.clearAllMocks();
    mockSend = jest.fn();

    mockSecretsManagerClient.mockImplementation(
      () =>
        ({
          send: mockSend,
        }) as any,
    );

    // Mock successful secret fetch
    mockSend.mockResolvedValue({
      SecretString: JSON.stringify(validSecretsData),
    });

    process.env.SECRETS_MANAGER_NAME = 'albyhub/secrets/test';
    process.env.AWS_REGION = 'us-east-1';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) should return 200 with status ok', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('environment');
        expect(res.body).toHaveProperty('version');
      });
  });

  it('/health (GET) should return valid JSON', async () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('/health (GET) should return a recent timestamp', async () => {
    const beforeRequest = new Date();
    const response = await request(app.getHttpServer()).get('/health');
    const afterRequest = new Date();

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
    expect(timestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
  });
});
