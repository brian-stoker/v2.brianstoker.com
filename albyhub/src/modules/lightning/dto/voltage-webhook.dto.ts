import { IsString, IsNumber, IsOptional, Matches } from 'class-validator';

/**
 * DTO for Voltage webhook payment notification
 */
export class VoltageWebhookDto {
  /**
   * Payment hash (hex-encoded, 64 characters)
   */
  @IsString()
  @Matches(/^[0-9a-f]{64}$/, {
    message: 'payment_hash must be a 64-character hex string',
  })
  payment_hash!: string;

  /**
   * Payment amount in satoshis
   */
  @IsNumber()
  amount_sats!: number;

  /**
   * Unix timestamp when payment was settled
   */
  @IsNumber()
  settled_at!: number;

  /**
   * Optional payment comment/memo
   */
  @IsOptional()
  @IsString()
  comment?: string;

  /**
   * Optional invoice description
   */
  @IsOptional()
  @IsString()
  description?: string;
}
