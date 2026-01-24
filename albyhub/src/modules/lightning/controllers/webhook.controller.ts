import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentVerificationService } from '../services/payment-verification.service';
import { LoggerService } from '../../../common/logger/logger.service';
import { VoltageWebhookDto } from '../dto/voltage-webhook.dto';

/**
 * Controller for handling Voltage payment webhooks
 */
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly verificationService: PaymentVerificationService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Voltage webhook endpoint
   * Receives payment notifications when invoices are paid
   *
   * @param signature - X-Voltage-Signature header for verification
   * @param payload - Webhook payload with payment details
   * @param req - Raw request for body verification
   * @returns 200 OK on success
   */
  @Post('voltage')
  @HttpCode(HttpStatus.OK)
  async handleVoltageWebhook(
    @Headers('x-voltage-signature') signature: string | undefined,
    @Body() payload: VoltageWebhookDto,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ status: string; message: string }> {
    const startTime = Date.now();

    try {
      // Validate signature header is present
      if (!signature) {
        this.logger.warn(
          'Webhook request missing X-Voltage-Signature header',
          'WebhookController',
        );
        throw new UnauthorizedException('Missing signature header');
      }

      // Get raw body for signature verification
      const rawBody = req.rawBody;
      if (!rawBody) {
        this.logger.error(
          'Raw body not available for signature verification',
          undefined,
          'WebhookController',
        );
        throw new InternalServerErrorException(
          'Server configuration error: raw body required',
        );
      }

      // Verify webhook signature
      const isSignatureValid = await this.verificationService.verifySignature(
        signature,
        rawBody.toString('utf8'),
      );

      if (!isSignatureValid) {
        this.logger.warn(
          'Webhook signature verification failed',
          'WebhookController',
          { paymentHash: payload.payment_hash },
        );
        throw new UnauthorizedException('Invalid signature');
      }

      // Check for missing payment_hash (should be caught by validation pipe, but double-check)
      if (!payload.payment_hash) {
        this.logger.warn(
          'Webhook payload missing payment_hash',
          'WebhookController',
        );
        throw new BadRequestException('Missing payment_hash');
      }

      // Verify payment details
      const verification = this.verificationService.verifyPaymentDetails(payload);
      if (!verification.isValid) {
        this.logger.warn(
          'Payment verification failed',
          'WebhookController',
          { error: verification.error, payload },
        );
        throw new BadRequestException(verification.error);
      }

      // Check for duplicate payment (idempotency)
      const isDuplicate = this.verificationService.isPaymentProcessed(
        payload.payment_hash,
      );

      if (isDuplicate) {
        // Log duplicate but still return 200 (idempotent)
        this.verificationService.logPayment(payload, true);
        const duration = Date.now() - startTime;

        this.logger.debug(
          'Duplicate webhook processed',
          'WebhookController',
          { paymentHash: payload.payment_hash, duration },
        );

        return {
          status: 'ok',
          message: 'Payment already processed',
        };
      }

      // Mark payment as processed before logging (to prevent race conditions)
      this.verificationService.markPaymentProcessed(payload.payment_hash);

      // Log successful payment
      this.verificationService.logPayment(payload, false);

      const duration = Date.now() - startTime;

      // Ensure we meet the <500ms SLA
      if (duration >= 500) {
        this.logger.warn(
          'Webhook processing exceeded 500ms SLA',
          'WebhookController',
          { duration, paymentHash: payload.payment_hash },
        );
      }

      this.logger.debug(
        'Webhook processed successfully',
        'WebhookController',
        { paymentHash: payload.payment_hash, duration },
      );

      return {
        status: 'ok',
        message: 'Payment received',
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Re-throw known HTTP exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log unexpected errors and return 500
      this.logger.error(
        'Unexpected error processing webhook',
        error instanceof Error ? error.stack : undefined,
        'WebhookController',
        {
          paymentHash: payload?.payment_hash,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );

      throw new InternalServerErrorException('Error processing webhook');
    }
  }
}
