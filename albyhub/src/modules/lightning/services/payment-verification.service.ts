import { Injectable } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { SecretsService } from '../../../config/secrets.config';
import { LoggerService } from '../../../common/logger/logger.service';
import { VoltageWebhookDto } from '../dto/voltage-webhook.dto';

interface ProcessedPayment {
  processedAt: number;
  expiresAt: number;
}

/**
 * Service for verifying Voltage webhook signatures and tracking processed payments
 */
@Injectable()
export class PaymentVerificationService {
  private readonly processedPayments = new Map<string, ProcessedPayment>();
  private readonly idempotencyTTL = 30 * 60 * 1000; // 30 minutes
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly secretsService: SecretsService,
    private readonly logger: LoggerService,
  ) {
    // Start cleanup interval to remove expired entries
    this.startCleanupInterval();
  }

  /**
   * Verifies the webhook signature using HMAC-SHA256
   *
   * @param signature - The X-Voltage-Signature header value
   * @param body - The raw request body as a string
   * @returns True if signature is valid
   */
  async verifySignature(signature: string, body: string): Promise<boolean> {
    try {
      const secrets = await this.secretsService.getSecrets();
      const webhookSecret = secrets.voltage.webhookSecret;

      if (!webhookSecret) {
        this.logger.error('Webhook secret not configured in Secrets Manager', 'PaymentVerificationService');
        return false;
      }

      // Calculate expected signature
      const hmac = createHmac('sha256', webhookSecret);
      hmac.update(body);
      const expectedSignature = hmac.digest('hex');

      // Use timing-safe comparison to prevent timing attacks
      if (signature.length !== expectedSignature.length) {
        return false;
      }

      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch (error) {
      this.logger.error(
        'Error verifying webhook signature',
        error instanceof Error ? error.stack : undefined,
        'PaymentVerificationService',
        { error: error instanceof Error ? error.message : 'Unknown error' },
      );
      return false;
    }
  }

  /**
   * Checks if a payment has already been processed (idempotency check)
   *
   * @param paymentHash - The payment hash to check
   * @returns True if payment has already been processed within TTL window
   */
  isPaymentProcessed(paymentHash: string): boolean {
    const record = this.processedPayments.get(paymentHash);

    if (!record) {
      return false;
    }

    // Check if record is still valid
    if (record.expiresAt < Date.now()) {
      this.processedPayments.delete(paymentHash);
      return false;
    }

    return true;
  }

  /**
   * Marks a payment as processed for idempotency tracking
   *
   * @param paymentHash - The payment hash to mark as processed
   */
  markPaymentProcessed(paymentHash: string): void {
    const now = Date.now();
    this.processedPayments.set(paymentHash, {
      processedAt: now,
      expiresAt: now + this.idempotencyTTL,
    });

    this.logger.debug(
      'Payment marked as processed',
      'PaymentVerificationService',
      { paymentHash, expiresIn: this.idempotencyTTL },
    );
  }

  /**
   * Verifies payment details from webhook payload
   *
   * @param payload - The webhook payload
   * @returns Object with isValid boolean and optional error message
   */
  verifyPaymentDetails(payload: VoltageWebhookDto): {
    isValid: boolean;
    error?: string;
  } {
    // Verify amount is positive
    if (payload.amount_sats <= 0) {
      return {
        isValid: false,
        error: `Invalid amount: ${payload.amount_sats} sats`,
      };
    }

    // Verify settled_at is a reasonable timestamp
    const now = Date.now();
    const settledAt = payload.settled_at * 1000; // Convert to milliseconds

    // Reject timestamps from the future
    if (settledAt > now + 60000) {
      // Allow 1 minute clock skew
      return {
        isValid: false,
        error: 'settled_at timestamp is in the future',
      };
    }

    // Reject timestamps older than 24 hours
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    if (settledAt < oneDayAgo) {
      return {
        isValid: false,
        error: 'settled_at timestamp is too old (>24 hours)',
      };
    }

    return { isValid: true };
  }

  /**
   * Logs payment details in structured format
   *
   * @param payload - The webhook payload
   * @param isDuplicate - Whether this is a duplicate payment
   */
  logPayment(payload: VoltageWebhookDto, isDuplicate = false): void {
    const logData = {
      payment_hash: payload.payment_hash,
      amount_sats: payload.amount_sats,
      settled_at: new Date(payload.settled_at * 1000).toISOString(),
      comment: payload.comment || undefined,
      description: payload.description || undefined,
      duplicate: isDuplicate,
    };

    if (isDuplicate) {
      this.logger.warn(
        'Duplicate payment webhook received',
        'PaymentVerificationService',
        logData,
      );
    } else {
      this.logger.log(
        'Payment received and verified',
        'PaymentVerificationService',
        logData,
      );
    }
  }

  /**
   * Starts periodic cleanup of expired payment records
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredPayments();
    }, 5 * 60 * 1000);
  }

  /**
   * Removes expired payment records from the cache
   */
  private cleanupExpiredPayments(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [paymentHash, record] of this.processedPayments.entries()) {
      if (record.expiresAt < now) {
        this.processedPayments.delete(paymentHash);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug(
        `Cleaned up ${removedCount} expired payment records`,
        'PaymentVerificationService',
      );
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get count of currently tracked payments (for testing/monitoring)
   */
  getTrackedPaymentCount(): number {
    return this.processedPayments.size;
  }

  /**
   * Clear all tracked payments (for testing)
   */
  clearTrackedPayments(): void {
    this.processedPayments.clear();
  }
}
