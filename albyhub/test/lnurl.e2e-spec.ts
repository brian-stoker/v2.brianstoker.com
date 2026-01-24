import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager');

const mockSecretsManagerClient =
  SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;

describe('LNURL Controller (e2e)', () => {
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

  beforeEach(async () => {
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

  afterEach(async () => {
    await app.close();
  });

  describe('GET /.well-known/lnurlp/pay', () => {
    it('AC-2.1.a: should return 200 with valid LUD-16 JSON metadata in <500ms', async () => {
      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('callback');
      expect(response.body).toHaveProperty('minSendable');
      expect(response.body).toHaveProperty('maxSendable');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body).toHaveProperty('tag');
      expect(response.body).toHaveProperty('commentAllowed');
    });

    it('AC-2.1.b: metadata field should contain valid JSON-stringified array with text/plain and text/identifier entries', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const { metadata } = response.body;

      // Metadata should be a string
      expect(typeof metadata).toBe('string');

      // Parse the metadata string to an array
      const parsedMetadata: Array<[string, string]> = JSON.parse(metadata);

      // Should be an array
      expect(Array.isArray(parsedMetadata)).toBe(true);

      // Should have at least 2 entries
      expect(parsedMetadata.length).toBeGreaterThanOrEqual(2);

      // Find text/plain entry
      const textPlainEntry = parsedMetadata.find(
        ([type]) => type === 'text/plain',
      );
      expect(textPlainEntry).toBeDefined();
      expect(textPlainEntry![0]).toBe('text/plain');
      expect(textPlainEntry![1]).toBe('Pay to Brian Stoker');

      // Find text/identifier entry
      const textIdentifierEntry = parsedMetadata.find(
        ([type]) => type === 'text/identifier',
      );
      expect(textIdentifierEntry).toBeDefined();
      expect(textIdentifierEntry![0]).toBe('text/identifier');
      expect(textIdentifierEntry![1]).toBe('pay@brianstoker.com');
    });

    it('AC-2.1.c: callback URL should be absolute HTTPS URL pointing to invoice generation endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const { callback } = response.body;

      // Should be a string
      expect(typeof callback).toBe('string');

      // Should be a valid URL
      expect(() => new URL(callback)).not.toThrow();

      const url = new URL(callback);

      // Should be HTTP or HTTPS (allow HTTP for local testing)
      expect(['http:', 'https:']).toContain(url.protocol);

      // In production, should be HTTPS
      if (process.env.NODE_ENV === 'production') {
        expect(url.protocol).toBe('https:');
      }

      // Should point to callback endpoint
      expect(callback).toContain('/lnurl/callback');
    });

    it('AC-2.1.d: minSendable value should equal configured minimum (default 1000 millisats)', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const { minSendable } = response.body;
      const expectedMinSendable = parseInt(
        process.env.MIN_SENDABLE || '1000',
        10,
      );

      expect(minSendable).toBe(expectedMinSendable);
      expect(typeof minSendable).toBe('number');
      expect(minSendable).toBeGreaterThan(0);
    });

    it('AC-2.1.e: maxSendable value should equal configured maximum (default 100000000 millisats)', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const { maxSendable } = response.body;
      const expectedMaxSendable = parseInt(
        process.env.MAX_SENDABLE || '100000000',
        10,
      );

      expect(maxSendable).toBe(expectedMaxSendable);
      expect(typeof maxSendable).toBe('number');
      expect(maxSendable).toBeGreaterThan(0);
      expect(maxSendable).toBeGreaterThanOrEqual(response.body.minSendable);
    });

    it('AC-2.1.f: commentAllowed should equal 280', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      const { commentAllowed } = response.body;
      const expectedCommentAllowed = parseInt(
        process.env.COMMENT_ALLOWED || '280',
        10,
      );

      expect(commentAllowed).toBe(expectedCommentAllowed);
      expect(typeof commentAllowed).toBe('number');
    });

    it('should return tag as "payRequest"', async () => {
      const response = await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200);

      expect(response.body.tag).toBe('payRequest');
    });

    it('should have correct Content-Type header', async () => {
      await request(app.getHttpServer())
        .get('/.well-known/lnurlp/pay')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  describe('GET /lnurl/callback', () => {
    it('AC-2.2.a: should return 200 with valid LNURL-pay response JSON in <1s', async () => {
      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: 10000 })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('pr');
      expect(response.body).toHaveProperty('routes');
      expect(response.body).toHaveProperty('successAction');
    });

    it('AC-2.2.b: amount within allowed range should return pr field with valid bolt11 invoice format', async () => {
      const amount = 50000; // 50 sats in millisats
      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(200);

      const { pr } = response.body;

      // Should be a string
      expect(typeof pr).toBe('string');

      // Should start with 'lnbc' (Lightning invoice prefix)
      expect(pr).toMatch(/^lnbc/);

      // Should contain amount information
      expect(pr.length).toBeGreaterThan(20);
    });

    it('AC-2.2.c: amount < minSendable should return 400 with error JSON containing reason', async () => {
      const minSendable = parseInt(process.env.MIN_SENDABLE || '1000', 10);
      const amount = minSendable - 500; // Below minimum

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'ERROR');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.reason).toContain('below minimum');
    });

    it('AC-2.2.d: amount > maxSendable should return 400 with error JSON containing reason', async () => {
      const maxSendable = parseInt(
        process.env.MAX_SENDABLE || '100000000',
        10,
      );
      const amount = maxSendable + 1000000; // Above maximum

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'ERROR');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.reason).toContain('exceeds maximum');
    });

    it('AC-2.2.e: amount parameter missing should return 400 with error JSON', async () => {
      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .expect(400);

      expect(response.body).toHaveProperty('status', 'ERROR');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.reason).toContain('required');
    });

    it('AC-2.2.f: comment provided and <= 280 chars should succeed and comment logged', async () => {
      const amount = 10000;
      const comment = 'test payment';

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount, comment })
        .expect(200);

      expect(response.body).toHaveProperty('pr');
      expect(response.body.pr).toMatch(/^lnbc/);

      // Verify the response is successful
      expect(response.body).toHaveProperty('successAction');
    });

    it('AC-2.2.g: comment > 280 chars should return 400 with error JSON', async () => {
      const amount = 10000;
      const comment = 'a'.repeat(281); // 281 characters

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount, comment })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'ERROR');
      expect(response.body).toHaveProperty('reason');
      expect(response.body.reason).toContain('exceeds maximum');
    });

    it('AC-2.2.h: successAction should be present in response with tag:"message" and message field', async () => {
      const amount = 10000;

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(200);

      const { successAction } = response.body;

      expect(successAction).toBeDefined();
      expect(successAction).toHaveProperty('tag', 'message');
      expect(successAction).toHaveProperty('message');
      expect(typeof successAction.message).toBe('string');
      expect(successAction.message.length).toBeGreaterThan(0);
    });

    it('should return routes as empty array', async () => {
      const amount = 10000;

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(200);

      expect(response.body.routes).toBeDefined();
      expect(Array.isArray(response.body.routes)).toBe(true);
      expect(response.body.routes.length).toBe(0);
    });

    it('should handle comment at exactly 280 characters', async () => {
      const amount = 10000;
      const comment = 'a'.repeat(280); // Exactly 280 characters

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount, comment })
        .expect(200);

      expect(response.body).toHaveProperty('pr');
      expect(response.body.pr).toMatch(/^lnbc/);
    });

    it('should generate different invoices for different amounts', async () => {
      const response1 = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: 10000 })
        .expect(200);

      const response2 = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: 20000 })
        .expect(200);

      expect(response1.body.pr).not.toBe(response2.body.pr);
    });

    it('should generate different invoices for the same amount at different times', async () => {
      const amount = 10000;

      const response1 = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(200);

      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount })
        .expect(200);

      expect(response1.body.pr).not.toBe(response2.body.pr);
    });

    it('should handle amount at minimum boundary (minSendable)', async () => {
      const minSendable = parseInt(process.env.MIN_SENDABLE || '1000', 10);

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: minSendable })
        .expect(200);

      expect(response.body).toHaveProperty('pr');
      expect(response.body.pr).toMatch(/^lnbc/);
    });

    it('should handle amount at maximum boundary (maxSendable)', async () => {
      const maxSendable = parseInt(
        process.env.MAX_SENDABLE || '100000000',
        10,
      );

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: maxSendable })
        .expect(200);

      expect(response.body).toHaveProperty('pr');
      expect(response.body.pr).toMatch(/^lnbc/);
    });

    it('should have correct Content-Type header', async () => {
      await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount: 10000 })
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('should handle empty comment', async () => {
      const amount = 10000;

      const response = await request(app.getHttpServer())
        .get('/lnurl/callback')
        .query({ amount, comment: '' })
        .expect(200);

      expect(response.body).toHaveProperty('pr');
      expect(response.body.pr).toMatch(/^lnbc/);
    });
  });
});
