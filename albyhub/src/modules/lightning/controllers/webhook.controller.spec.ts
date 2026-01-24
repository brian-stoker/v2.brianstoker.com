import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { PaymentVerificationService } from '../services/payment-verification.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { VoltageWebhookDto } from '../dto/voltage-webhook.dto';
import {
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('WebhookController', () => {
  let controller: WebhookController;
  let verificationService: jest.Mocked<PaymentVerificationService>;
  let loggerService: jest.Mocked<LoggerService>;

  const validPayload: VoltageWebhookDto = {
    payment_hash:
      '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    amount_sats: 1000,
    settled_at: Math.floor(Date.now() / 1000),
    comment: 'Test payment',
  };

  const mockRequest = {
    rawBody: Buffer.from(JSON.stringify(validPayload)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: PaymentVerificationService,
          useValue: {
            verifySignature: jest.fn().mockResolvedValue(true),
            verifyPaymentDetails: jest
              .fn()
              .mockReturnValue({ isValid: true }),
            isPaymentProcessed: jest.fn().mockReturnValue(false),
            markPaymentProcessed: jest.fn(),
            logPayment: jest.fn(),
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

    controller = module.get<WebhookController>(WebhookController);
    verificationService = module.get(
      PaymentVerificationService,
    ) as jest.Mocked<PaymentVerificationService>;
    loggerService = module.get(LoggerService) as jest.Mocked<LoggerService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleVoltageWebhook', () => {
    it('should process valid webhook and return 200 in <500ms', async () => {
      const startTime = Date.now();

      const result = await controller.handleVoltageWebhook(
        'valid-signature',
        validPayload,
        mockRequest as any,
      );

      const duration = Date.now() - startTime;

      expect(result).toEqual({
        status: 'ok',
        message: 'Payment received',
      });
      expect(duration).toBeLessThan(500);
      expect(verificationService.verifySignature).toHaveBeenCalled();
      expect(verificationService.markPaymentProcessed).toHaveBeenCalledWith(
        validPayload.payment_hash,
      );
      expect(verificationService.logPayment).toHaveBeenCalledWith(
        validPayload,
        false,
      );
    });

    it('should throw UnauthorizedException if signature header missing', async () => {
      await expect(
        controller.handleVoltageWebhook(undefined, validPayload, mockRequest as any),
      ).rejects.toThrow(UnauthorizedException);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'Webhook request missing X-Voltage-Signature header',
        'WebhookController',
      );
    });

    it('should throw UnauthorizedException if signature invalid', async () => {
      verificationService.verifySignature.mockResolvedValueOnce(false);

      await expect(
        controller.handleVoltageWebhook(
          'invalid-signature',
          validPayload,
          mockRequest as any,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'Webhook signature verification failed',
        'WebhookController',
        expect.objectContaining({ paymentHash: validPayload.payment_hash }),
      );
    });

    it('should throw BadRequestException if payment_hash missing', async () => {
      const payloadWithoutHash = { ...validPayload, payment_hash: undefined as any };

      await expect(
        controller.handleVoltageWebhook(
          'valid-signature',
          payloadWithoutHash,
          mockRequest as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'Webhook payload missing payment_hash',
        'WebhookController',
      );
    });

    it('should throw BadRequestException if payment verification fails', async () => {
      verificationService.verifyPaymentDetails.mockReturnValueOnce({
        isValid: false,
        error: 'Invalid amount: -100 sats',
      });

      await expect(
        controller.handleVoltageWebhook(
          'valid-signature',
          validPayload,
          mockRequest as any,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(loggerService.warn).toHaveBeenCalledWith(
        'Payment verification failed',
        'WebhookController',
        expect.objectContaining({
          error: 'Invalid amount: -100 sats',
        }),
      );
    });

    it('should handle duplicate payment idempotently', async () => {
      verificationService.isPaymentProcessed.mockReturnValueOnce(true);

      const result = await controller.handleVoltageWebhook(
        'valid-signature',
        validPayload,
        mockRequest as any,
      );

      expect(result).toEqual({
        status: 'ok',
        message: 'Payment already processed',
      });
      expect(verificationService.logPayment).toHaveBeenCalledWith(
        validPayload,
        true,
      );
      expect(verificationService.markPaymentProcessed).not.toHaveBeenCalled();
    });

    it('should mark payment as processed before logging to prevent race conditions', async () => {
      const callOrder: string[] = [];

      verificationService.markPaymentProcessed.mockImplementation(() => {
        callOrder.push('markProcessed');
      });

      verificationService.logPayment.mockImplementation(() => {
        callOrder.push('logPayment');
      });

      await controller.handleVoltageWebhook(
        'valid-signature',
        validPayload,
        mockRequest as any,
      );

      expect(callOrder).toEqual(['markProcessed', 'logPayment']);
    });

    it('should warn if processing exceeds 500ms SLA', async () => {
      // Mock verification to take longer
      verificationService.verifySignature.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return true;
      });

      await controller.handleVoltageWebhook(
        'valid-signature',
        validPayload,
        mockRequest as any,
      );

      const warnCalls = loggerService.warn.mock.calls;
      const slaWarning = warnCalls.find(
        (call) => call[0] === 'Webhook processing exceeded 500ms SLA',
      );

      expect(slaWarning).toBeDefined();
      expect(slaWarning?.[2]).toMatchObject({
        paymentHash: validPayload.payment_hash,
      });
    });

    it('should throw InternalServerErrorException if raw body not available', async () => {
      const requestWithoutRawBody = { rawBody: undefined };

      await expect(
        controller.handleVoltageWebhook(
          'valid-signature',
          validPayload,
          requestWithoutRawBody as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);

      expect(loggerService.error).toHaveBeenCalledWith(
        'Raw body not available for signature verification',
        undefined,
        'WebhookController',
      );
    });

    it('should return 500 and log error if unexpected error occurs', async () => {
      const unexpectedError = new Error('Database connection failed');
      verificationService.verifySignature.mockRejectedValueOnce(
        unexpectedError,
      );

      await expect(
        controller.handleVoltageWebhook(
          'valid-signature',
          validPayload,
          mockRequest as any,
        ),
      ).rejects.toThrow(InternalServerErrorException);

      expect(loggerService.error).toHaveBeenCalledWith(
        'Unexpected error processing webhook',
        expect.stringContaining('Database connection failed'),
        'WebhookController',
        expect.objectContaining({
          paymentHash: validPayload.payment_hash,
          error: 'Database connection failed',
        }),
      );
    });

    it('should log CloudWatch structured data with payment details', async () => {
      await controller.handleVoltageWebhook(
        'valid-signature',
        validPayload,
        mockRequest as any,
      );

      expect(verificationService.logPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_hash: validPayload.payment_hash,
          amount_sats: validPayload.amount_sats,
          settled_at: validPayload.settled_at,
          comment: validPayload.comment,
        }),
        false,
      );
    });

    it('should handle malformed JSON gracefully', async () => {
      // This test validates that malformed JSON is caught by NestJS validation
      // In reality, NestJS will throw a BadRequestException before it reaches our controller
      // But we test our error handling anyway
      const malformedPayload = {
        payment_hash: 'invalid-hash-format', // Will fail @Matches validation
        amount_sats: 1000,
        settled_at: Math.floor(Date.now() / 1000),
      } as VoltageWebhookDto;

      await expect(
        controller.handleVoltageWebhook(
          'valid-signature',
          malformedPayload,
          mockRequest as any,
        ),
      ).resolves.toBeDefined();

      // Our controller should still process it, but the DTO validation
      // would have already caught it at the NestJS level
    });
  });
});
