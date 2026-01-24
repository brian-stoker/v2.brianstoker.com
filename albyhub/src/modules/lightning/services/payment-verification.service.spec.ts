import { Test, TestingModule } from '@nestjs/testing';
import { PaymentVerificationService } from './payment-verification.service';
import { SecretsService } from '../../../config/secrets.config';
import { LoggerService } from '../../../common/logger/logger.service';
import { VoltageWebhookDto } from '../dto/voltage-webhook.dto';
import { createHmac } from 'crypto';

describe('PaymentVerificationService', () => {
  let service: PaymentVerificationService;
  let secretsService: jest.Mocked<SecretsService>;
  let loggerService: jest.Mocked<LoggerService>;

  const mockWebhookSecret = 'test-webhook-secret-key';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentVerificationService,
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
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentVerificationService>(
      PaymentVerificationService,
    );
    secretsService = module.get(SecretsService) as jest.Mocked<SecretsService>;
    loggerService = module.get(LoggerService) as jest.Mocked<LoggerService>;

    // Clear tracked payments before each test
    service.clearTrackedPayments();
  });

  afterEach(() => {
    // Clean up any intervals
    service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', async () => {
      const body = JSON.stringify({ test: 'data' });
      const hmac = createHmac('sha256', mockWebhookSecret);
      hmac.update(body);
      const signature = hmac.digest('hex');

      const result = await service.verifySignature(signature, body);

      expect(result).toBe(true);
    });

    it('should return false for invalid signature', async () => {
      const body = JSON.stringify({ test: 'data' });
      const invalidSignature = 'invalid-signature-hash';

      const result = await service.verifySignature(invalidSignature, body);

      expect(result).toBe(false);
    });

    it('should return false for signature with different body', async () => {
      const body1 = JSON.stringify({ test: 'data1' });
      const body2 = JSON.stringify({ test: 'data2' });

      const hmac = createHmac('sha256', mockWebhookSecret);
      hmac.update(body1);
      const signature = hmac.digest('hex');

      const result = await service.verifySignature(signature, body2);

      expect(result).toBe(false);
    });

    it('should return false if webhook secret not configured', async () => {
      secretsService.getSecrets.mockResolvedValueOnce({
        voltage: {
          apiKey: 'test-api-key',
          macaroon: 'test-macaroon',
          connectionUrl: 'test-url',
          webhookSecret: '',
        },
        nostr: {
          privateKey: 'test-private-key',
          publicKey: 'test-public-key',
          relayUrl: 'test-relay-url',
        },
      });

      const body = JSON.stringify({ test: 'data' });
      const result = await service.verifySignature('any-signature', body);

      expect(result).toBe(false);
      expect(loggerService.error).toHaveBeenCalledWith(
        'Webhook secret not configured in Secrets Manager',
        'PaymentVerificationService',
      );
    });

    it('should handle errors gracefully', async () => {
      secretsService.getSecrets.mockRejectedValueOnce(
        new Error('Secrets fetch failed'),
      );

      const body = JSON.stringify({ test: 'data' });
      const result = await service.verifySignature('any-signature', body);

      expect(result).toBe(false);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('isPaymentProcessed', () => {
    it('should return false for new payment hash', () => {
      const paymentHash =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      const result = service.isPaymentProcessed(paymentHash);

      expect(result).toBe(false);
    });

    it('should return true for previously processed payment', () => {
      const paymentHash =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      service.markPaymentProcessed(paymentHash);
      const result = service.isPaymentProcessed(paymentHash);

      expect(result).toBe(true);
    });

    it('should return false for expired payment record', () => {
      const paymentHash =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      // Mark payment as processed
      service.markPaymentProcessed(paymentHash);

      // Manually expire the record by manipulating the internal map
      const processedPayments = (service as any).processedPayments;
      processedPayments.set(paymentHash, {
        processedAt: Date.now() - 31 * 60 * 1000, // 31 minutes ago
        expiresAt: Date.now() - 60 * 1000, // 1 minute ago
      });

      const result = service.isPaymentProcessed(paymentHash);

      expect(result).toBe(false);
    });
  });

  describe('markPaymentProcessed', () => {
    it('should mark payment as processed', () => {
      const paymentHash =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      service.markPaymentProcessed(paymentHash);

      expect(service.isPaymentProcessed(paymentHash)).toBe(true);
    });

    it('should log debug message when marking payment', () => {
      const paymentHash =
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      service.markPaymentProcessed(paymentHash);

      expect(loggerService.debug).toHaveBeenCalledWith(
        'Payment marked as processed',
        'PaymentVerificationService',
        expect.objectContaining({
          paymentHash,
        }),
      );
    });
  });

  describe('verifyPaymentDetails', () => {
    const validPayload: VoltageWebhookDto = {
      payment_hash:
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount_sats: 1000,
      settled_at: Math.floor(Date.now() / 1000), // Current time in seconds
    };

    it('should return valid for correct payment details', () => {
      const result = service.verifyPaymentDetails(validPayload);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject negative amount', () => {
      const payload = { ...validPayload, amount_sats: -100 };

      const result = service.verifyPaymentDetails(payload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid amount');
    });

    it('should reject zero amount', () => {
      const payload = { ...validPayload, amount_sats: 0 };

      const result = service.verifyPaymentDetails(payload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid amount');
    });

    it('should reject future timestamp', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes in future
      const payload = { ...validPayload, settled_at: futureTime };

      const result = service.verifyPaymentDetails(payload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('future');
    });

    it('should reject old timestamp (>24 hours)', () => {
      const oldTime = Math.floor(Date.now() / 1000) - 25 * 60 * 60; // 25 hours ago
      const payload = { ...validPayload, settled_at: oldTime };

      const result = service.verifyPaymentDetails(payload);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too old');
    });

    it('should accept timestamp within 1 minute clock skew', () => {
      const nearFuture = Math.floor(Date.now() / 1000) + 30; // 30 seconds in future
      const payload = { ...validPayload, settled_at: nearFuture };

      const result = service.verifyPaymentDetails(payload);

      expect(result.isValid).toBe(true);
    });
  });

  describe('logPayment', () => {
    const payload: VoltageWebhookDto = {
      payment_hash:
        '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      amount_sats: 1000,
      settled_at: Math.floor(Date.now() / 1000),
      comment: 'Test payment',
      description: 'Test description',
    };

    it('should log payment with all details', () => {
      service.logPayment(payload, false);

      expect(loggerService.log).toHaveBeenCalledWith(
        'Payment received and verified',
        'PaymentVerificationService',
        expect.objectContaining({
          payment_hash: payload.payment_hash,
          amount_sats: payload.amount_sats,
          comment: payload.comment,
          description: payload.description,
          duplicate: false,
        }),
      );
    });

    it('should log duplicate payment with warn level', () => {
      service.logPayment(payload, true);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'Duplicate payment webhook received',
        'PaymentVerificationService',
        expect.objectContaining({
          payment_hash: payload.payment_hash,
          duplicate: true,
        }),
      );
    });

    it('should handle missing optional fields', () => {
      const minimalPayload: VoltageWebhookDto = {
        payment_hash:
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        amount_sats: 1000,
        settled_at: Math.floor(Date.now() / 1000),
      };

      service.logPayment(minimalPayload, false);

      expect(loggerService.log).toHaveBeenCalledWith(
        'Payment received and verified',
        'PaymentVerificationService',
        expect.objectContaining({
          payment_hash: minimalPayload.payment_hash,
          amount_sats: minimalPayload.amount_sats,
        }),
      );
    });
  });

  describe('getTrackedPaymentCount', () => {
    it('should return 0 initially', () => {
      expect(service.getTrackedPaymentCount()).toBe(0);
    });

    it('should return correct count after marking payments', () => {
      service.markPaymentProcessed('hash1');
      service.markPaymentProcessed('hash2');
      service.markPaymentProcessed('hash3');

      expect(service.getTrackedPaymentCount()).toBe(3);
    });
  });

  describe('clearTrackedPayments', () => {
    it('should clear all tracked payments', () => {
      service.markPaymentProcessed('hash1');
      service.markPaymentProcessed('hash2');

      expect(service.getTrackedPaymentCount()).toBe(2);

      service.clearTrackedPayments();

      expect(service.getTrackedPaymentCount()).toBe(0);
    });
  });
});
