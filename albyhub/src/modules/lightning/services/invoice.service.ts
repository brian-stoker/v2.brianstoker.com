import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class InvoiceService {
  /**
   * Generates a mock Lightning bolt11 invoice for testing purposes.
   * In production, this would call the actual Lightning node API.
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
