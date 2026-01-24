import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { NwcWalletService } from '../../nwc/services/nwc-wallet.service';

export interface GenerateInvoiceResult {
  bolt11: string;
  payment_hash: string;
  expires_at: number;
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly nwcWallet: NwcWalletService) {}

  /**
   * Generates a real Lightning bolt11 invoice using Voltage API via NWC.
   *
   * @param amountMillisats - Payment amount in millisatoshis
   * @param metadata - Payment metadata (LNURL metadata string)
   * @param comment - Optional payment comment
   * @returns Invoice result with bolt11, payment hash, and expiry
   * @throws Error if invoice generation fails
   */
  async generateInvoice(
    amountMillisats: number,
    metadata: string,
    comment?: string,
  ): Promise<GenerateInvoiceResult> {
    const startTime = Date.now();

    try {
      // Create invoice description from metadata and comment
      const description = this.createDescription(metadata, comment);

      this.logger.log(
        `Generating invoice for ${amountMillisats} msats${comment ? ' with comment' : ''}`,
      );

      // Call Voltage API via NWC
      const result = await this.nwcWallet.makeInvoice({
        amount: amountMillisats,
        description,
        expiry: 600, // 10 minutes
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Invoice generated in ${duration}ms`, {
        payment_hash: result.payment_hash.substring(0, 16) + '...',
        duration,
      });

      return {
        bolt11: result.invoice,
        payment_hash: result.payment_hash,
        expires_at: result.expires_at,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Failed to generate invoice after ${duration}ms`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Create invoice description from metadata and optional comment.
   * Hashes metadata per LNURL spec for verification.
   *
   * @param metadata - LNURL metadata JSON string
   * @param comment - Optional payment comment
   * @returns Invoice description string
   */
  private createDescription(metadata: string, comment?: string): string {
    // Hash metadata per LNURL spec (LUD-06)
    const metadataHash = createHash('sha256').update(metadata).digest('hex');

    // Include comment if provided
    if (comment) {
      return `${comment} [${metadataHash.substring(0, 16)}...]`;
    }

    return `Payment [${metadataHash.substring(0, 16)}...]`;
  }

  /**
   * Generates a mock Lightning bolt11 invoice for testing purposes.
   * DEPRECATED: Use generateInvoice() for production.
   *
   * @param amountMillisats - Payment amount in millisatoshis
   * @param description - Payment description/metadata
   * @param comment - Optional payment comment
   * @returns Mock bolt11 invoice string
   */
  generateMockInvoice(
    amountMillisats: number,
    description: string,
    comment?: string,
  ): string {
    // Generate deterministic payment hash based on amount, timestamp, and comment
    const timestamp = Date.now();
    const hashInput = `${amountMillisats}-${timestamp}-${comment || ''}`;
    const paymentHash = createHash('sha256')
      .update(hashInput)
      .digest('hex')
      .substring(0, 64);

    // Convert millisats to sats for the invoice amount
    const amountSats = Math.floor(amountMillisats / 1000);

    // Create a mock bolt11 invoice with realistic structure
    // Format: lnbc<amount><multiplier><timestamp>p<payment_hash><checksum>
    // This is a simplified mock - real bolt11 invoices use bech32 encoding
    const invoice = `lnbc${amountSats}n${timestamp}p${paymentHash}`;

    return invoice;
  }

  /**
   * Validates that an amount is within the allowed range.
   *
   * @param amount - Amount to validate in millisatoshis
   * @param minSendable - Minimum allowed amount in millisatoshis
   * @param maxSendable - Maximum allowed amount in millisatoshis
   * @returns Object with isValid boolean and optional error reason
   */
  validateAmount(
    amount: number,
    minSendable: number,
    maxSendable: number,
  ): { isValid: boolean; reason?: string } {
    if (amount < minSendable) {
      return {
        isValid: false,
        reason: `Amount ${amount} is below minimum sendable ${minSendable}`,
      };
    }

    if (amount > maxSendable) {
      return {
        isValid: false,
        reason: `Amount ${amount} exceeds maximum sendable ${maxSendable}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Validates that a comment is within the allowed length.
   *
   * @param comment - Comment to validate
   * @param maxLength - Maximum allowed comment length (default: 280)
   * @returns Object with isValid boolean and optional error reason
   */
  validateComment(
    comment: string | undefined,
    maxLength = 280,
  ): { isValid: boolean; reason?: string } {
    if (!comment) {
      return { isValid: true };
    }

    if (comment.length > maxLength) {
      return {
        isValid: false,
        reason: `Comment length ${comment.length} exceeds maximum allowed ${maxLength}`,
      };
    }

    return { isValid: true };
  }
}
