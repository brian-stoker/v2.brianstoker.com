import { Injectable, Logger } from '@nestjs/common';
import { NwcConnectionService, NwcResponse } from './nwc-connection.service';

export interface MakeInvoiceParams {
  amount: number; // millisatoshis
  description: string;
  expiry?: number; // seconds, default 600
}

export interface MakeInvoiceResult {
  invoice: string; // bolt11 invoice string
  payment_hash: string; // Payment hash (hex)
  expires_at: number; // Expiry timestamp (unix seconds)
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * NWC Wallet Service for Voltage wallet operations.
 * Implements invoice generation with retry logic and error handling.
 */
@Injectable()
export class NwcWalletService {
  private readonly logger = new Logger(NwcWalletService.name);
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  };

  constructor(private readonly nwcConnection: NwcConnectionService) {}

  /**
   * Generate a Lightning invoice using Voltage API via NWC protocol.
   * Implements retry logic for transient errors.
   *
   * @param params - Invoice parameters
   * @returns Invoice result with bolt11 string and payment hash
   * @throws Error if invoice generation fails after retries
   */
  async makeInvoice(params: MakeInvoiceParams): Promise<MakeInvoiceResult> {
    const { amount, description, expiry = 600 } = params;

    this.logger.log(`Making invoice: ${amount} msats`, {
      description: description.substring(0, 50),
      expiry,
    });

    // Validate NWC connection is ready
    if (!this.nwcConnection.isReady()) {
      throw new Error('NWC connection not ready');
    }

    // Retry wrapper with exponential backoff
    return this.retryWithBackoff(
      async () => {
        const response = await this.nwcConnection.sendRequest('make_invoice', {
          amount,
          description,
          expiry,
        });

        return this.parseInvoiceResponse(response);
      },
      (error) => this.shouldRetry(error),
      this.defaultRetryConfig,
    );
  }

  /**
   * Parse NWC make_invoice response and validate format.
   */
  private parseInvoiceResponse(response: NwcResponse): MakeInvoiceResult {
    if (response.error) {
      // Map NWC error to user-friendly message
      const errorMessage = this.mapNwcError(response.error);
      throw new Error(errorMessage);
    }

    if (!response.result) {
      throw new Error('Invalid response: missing result');
    }

    const { invoice, payment_hash, expires_at } = response.result;

    // Validate response fields
    if (!invoice || typeof invoice !== 'string') {
      throw new Error('Invalid response: missing or invalid invoice');
    }

    if (!payment_hash || typeof payment_hash !== 'string') {
      throw new Error('Invalid response: missing or invalid payment_hash');
    }

    // Validate payment hash is 64-character hex string
    if (!/^[0-9a-f]{64}$/i.test(payment_hash)) {
      throw new Error(
        `Invalid payment_hash format: expected 64-char hex, got ${payment_hash.length} chars`,
      );
    }

    if (typeof expires_at !== 'number') {
      throw new Error('Invalid response: missing or invalid expires_at');
    }

    this.logger.log('Invoice generated successfully', {
      payment_hash: payment_hash.substring(0, 16) + '...',
      expires_at,
    });

    return {
      invoice,
      payment_hash,
      expires_at,
    };
  }

  /**
   * Map NWC error codes to user-friendly messages.
   */
  private mapNwcError(error: { code: string; message: string }): string {
    const { code, message } = error;

    // Map common error codes
    switch (code) {
      case 'INSUFFICIENT_BALANCE':
      case 'INSUFFICIENT_LIQUIDITY':
        return `Insufficient liquidity: ${message}`;
      case 'QUOTA_EXCEEDED':
        return `Quota exceeded: ${message}`;
      case 'UNAUTHORIZED':
        return `Unauthorized: ${message}`;
      case 'RATE_LIMITED':
        return `Rate limited: ${message}`;
      case 'INVALID_AMOUNT':
        return `Invalid amount: ${message}`;
      case 'INTERNAL_ERROR':
        return `Internal error: ${message}`;
      default:
        return `${code}: ${message}`;
    }
  }

  /**
   * Determine if an error should trigger a retry.
   * Transient errors (network, timeout) should retry.
   * Permanent errors (invalid amount, insufficient liquidity) should not.
   */
  private shouldRetry(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Don't retry permanent errors
    const permanentErrors = [
      'insufficient liquidity',
      'insufficient balance',
      'invalid amount',
      'quota exceeded',
      'unauthorized',
      'invalid response',
      'missing or invalid',
    ];

    for (const permanentError of permanentErrors) {
      if (message.includes(permanentError)) {
        this.logger.warn(`Not retrying permanent error: ${error.message}`);
        return false;
      }
    }

    // Retry transient errors
    const transientErrors = [
      'timeout',
      'network',
      'connection',
      'econnrefused',
      'enotfound',
      'etimedout',
      'rate limited',
    ];

    for (const transientError of transientErrors) {
      if (message.includes(transientError)) {
        this.logger.log(`Will retry transient error: ${error.message}`);
        return true;
      }
    }

    // Default: don't retry unknown errors
    this.logger.warn(`Not retrying unknown error: ${error.message}`);
    return false;
  }

  /**
   * Execute an async operation with exponential backoff retry logic.
   *
   * @param operation - Async operation to execute
   * @param shouldRetryFn - Function to determine if error should trigger retry
   * @param config - Retry configuration
   * @returns Result of the operation
   * @throws Last error if all retries exhausted
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    shouldRetryFn: (error: Error) => boolean,
    config: RetryConfig,
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = config.initialDelayMs;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Execute operation
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // If this was the last attempt, throw
        if (attempt === config.maxRetries) {
          this.logger.error(
            `Operation failed after ${config.maxRetries} retries`,
            lastError.stack,
          );
          throw lastError;
        }

        // Check if we should retry this error
        if (!shouldRetryFn(lastError)) {
          throw lastError;
        }

        // Log retry attempt
        this.logger.warn(
          `Attempt ${attempt + 1}/${config.maxRetries + 1} failed, retrying in ${delay}ms`,
          {
            error: lastError.message,
          },
        );

        // Wait with exponential backoff
        await this.sleep(delay);

        // Calculate next delay with exponential backoff
        delay = Math.min(
          delay * config.backoffMultiplier,
          config.maxDelayMs,
        );
      }
    }

    // Should never reach here, but TypeScript doesn't know that
    throw lastError || new Error('Retry loop completed without result');
  }

  /**
   * Sleep for specified milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get balance from Voltage wallet.
   */
  async getBalance(): Promise<number> {
    this.logger.log('Getting wallet balance');

    const response = await this.nwcConnection.getBalance();

    if (response.error) {
      throw new Error(`Failed to get balance: ${response.error.message}`);
    }

    if (!response.result || typeof response.result.balance !== 'number') {
      throw new Error('Invalid balance response');
    }

    return response.result.balance;
  }

  /**
   * Get wallet info from Voltage.
   */
  async getInfo(): Promise<any> {
    this.logger.log('Getting wallet info');

    const response = await this.nwcConnection.getInfo();

    if (response.error) {
      throw new Error(`Failed to get info: ${response.error.message}`);
    }

    return response.result;
  }
}
