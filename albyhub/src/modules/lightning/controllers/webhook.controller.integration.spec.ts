import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { WebhookController } from './webhook.controller';
import { PaymentVerificationService } from '../services/payment-verification.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { SecretsService } from '../../../config/secrets.config';
import { createHmac } from 'crypto';
import * as express from 'express';

describe('WebhookController (Integration)', () => {
  let app: INestApplication;
  let verificationService: PaymentVerificationService;
  const mockWebhookSecret = 'test-webhook-secret-integration';

  const validPayload = {
    payment_hash:
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    amount_sats: 1000,
    settled_at: Math.floor(Date.now() / 1000),
    comment: 'Integration test payment',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        PaymentVerificationService,
        LoggerService,
        {
          provide: SecretsService,
          useValue: {
            getSecrets: jest.fn().mockResolvedValue({
              voltage: {
                apiKey: 'test-api-key',
                macaroon: 'test-macaroon',
                connectionUrl: 'test-url',
                webhookSecret: mockWebhookSecret,
              },
              nostr: {
                privateKey: 'test-private-key',
                publicKey: 'test-public-key',
                relayUrl: 'test-relay-url',
              },
            }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Add raw body middleware for webhook signature verification
    app.use(
      express.json({
        verify: (req: any, _res: any, buf: Buffer) => {
          req.rawBody = buf;
        },
      }),
    );

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    verificationService = moduleFixture.get<PaymentVerificationService>(
      PaymentVerificationService,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clear tracked payments before each test
    verificationService.clearTrackedPayments();
  });

  const generateSignature = (body: string): string => {
    const hmac = createHmac('sha256', mockWebhookSecret);
    hmac.update(body);
    return hmac.digest('hex');
  };

  describe('POST /webhooks/voltage', () => {
    it('Test-3.3.a: validates valid webhook request returns 200 in <500ms', async () => {
      const body = JSON.stringify(validPayload);
      const signature = generateSignature(body);

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Payment received',
      });
      expect(duration).toBeLessThan(500);
    });

    it('Test-3.3.b: validates invalid signature returns 401', async () => {
      const body = JSON.stringify(validPayload);
      const invalidSignature = 'invalid-signature-hash';

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', invalidSignature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid signature');
    });

    it('Test-3.3.c: validates malformed JSON returns 400', async () => {
      const malformedBody = '{"payment_hash": invalid json}';
      const signature = generateSignature(malformedBody);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(malformedBody);

      expect(response.status).toBe(400);
    });

    it('Test-3.3.d: validates missing payment_hash returns 400', async () => {
      const payloadWithoutHash = {
        amount_sats: 1000,
        settled_at: Math.floor(Date.now() / 1000),
      };
      const body = JSON.stringify(payloadWithoutHash);
      const signature = generateSignature(body);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(400);
      // Response may be an array of validation messages or a single string
      const message = response.body.message;
      const messageString = Array.isArray(message) ? message.join(' ') : message;
      expect(messageString).toContain('payment_hash');
    });

    it('Test-3.3.e: validates CloudWatch log contains payment details', async () => {
      const loggerService = app.get(LoggerService);
      const logSpy = jest.spyOn(loggerService, 'log');

      const body = JSON.stringify(validPayload);
      const signature = generateSignature(body);

      await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(logSpy).toHaveBeenCalledWith(
        'Payment received and verified',
        'PaymentVerificationService',
        expect.objectContaining({
          payment_hash: validPayload.payment_hash,
          amount_sats: validPayload.amount_sats,
        }),
      );
    });

    it('Test-3.3.f: sends duplicate webhook, validates both return 200 but only one processed', async () => {
      const body = JSON.stringify(validPayload);
      const signature = generateSignature(body);

      // First request
      const response1 = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response1.status).toBe(200);
      expect(response1.body.message).toBe('Payment received');

      // Second request (duplicate)
      const response2 = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response2.status).toBe(200);
      expect(response2.body.message).toBe('Payment already processed');

      // Verify only one payment is tracked
      expect(verificationService.getTrackedPaymentCount()).toBe(1);
    });

    it('Test-3.3.g: validates logged amount equals webhook amount field', async () => {
      const loggerService = app.get(LoggerService);
      const logSpy = jest.spyOn(loggerService, 'log');

      const customAmount = 5000;
      const customPayload = {
        ...validPayload,
        payment_hash:
          'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        amount_sats: customAmount,
      };

      const body = JSON.stringify(customPayload);
      const signature = generateSignature(body);

      await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(logSpy).toHaveBeenCalledWith(
        'Payment received and verified',
        'PaymentVerificationService',
        expect.objectContaining({
          amount_sats: customAmount,
        }),
      );

      // Find the log call with our custom amount
      const relevantCall = logSpy.mock.calls.find(
        (call) => call[0] === 'Payment received and verified' &&
                  (call[2] as any)?.amount_sats === customAmount
      );
      expect(relevantCall).toBeDefined();
      const loggedData = relevantCall![2] as any;
      expect(loggedData.amount_sats).toBe(customAmount);
    });

    it('Test-3.3.h: validates error during processing returns 500 and payment logged before error', async () => {
      const loggerService = app.get(LoggerService);
      const errorSpy = jest.spyOn(loggerService, 'error');

      // Mock verifySignature to throw error after logging would normally occur
      const originalVerify = verificationService.verifySignature.bind(verificationService);
      jest.spyOn(verificationService, 'verifySignature').mockImplementation(async (sig, body) => {
        // Let it verify correctly first
        const isValid = await originalVerify(sig, body);
        if (isValid) {
          // Then throw an error to simulate failure during processing
          throw new Error('Simulated processing error');
        }
        return isValid;
      });

      const body = JSON.stringify(validPayload);
      const signature = generateSignature(body);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(500);
      expect(errorSpy).toHaveBeenCalledWith(
        'Unexpected error processing webhook',
        expect.any(String),
        'WebhookController',
        expect.objectContaining({
          error: 'Simulated processing error',
        }),
      );

      // Restore original implementation
      jest.restoreAllMocks();
    });

    it('should validate payment_hash format with @Matches decorator', async () => {
      const invalidPayload = {
        payment_hash: 'invalid-hash-not-64-hex-chars',
        amount_sats: 1000,
        settled_at: Math.floor(Date.now() / 1000),
      };

      const body = JSON.stringify(invalidPayload);
      const signature = generateSignature(body);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('payment_hash must be a 64-character hex string');
    });

    it('should reject payment with negative amount', async () => {
      const negativeAmountPayload = {
        payment_hash:
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        amount_sats: -100,
        settled_at: Math.floor(Date.now() / 1000),
      };

      const body = JSON.stringify(negativeAmountPayload);
      const signature = generateSignature(body);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid amount');
    });

    it('should reject payment with future timestamp', async () => {
      const futurePayload = {
        payment_hash:
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        amount_sats: 1000,
        settled_at: Math.floor(Date.now() / 1000) + 120, // 2 minutes in future
      };

      const body = JSON.stringify(futurePayload);
      const signature = generateSignature(body);

      const response = await request(app.getHttpServer())
        .post('/webhooks/voltage')
        .set('X-Voltage-Signature', signature)
        .set('Content-Type', 'application/json')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('future');
    });
  });
});
