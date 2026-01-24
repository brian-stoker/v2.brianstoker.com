import {
  Controller,
  Get,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvoiceService } from '../services/invoice.service';
import { LnurlCallbackQueryDto } from '../dto/lnurl-callback-query.dto';
import {
  LnurlCallbackResponse,
  LnurlErrorResponse,
} from '../dto/lnurl-callback-response.dto';
import { LoggerService } from '../../../common/logger/logger.service';

@Controller()
export class LnurlController {
  private readonly context = 'LnurlController';

  constructor(
    private readonly configService: ConfigService,
    private readonly invoiceService: InvoiceService,
    private readonly logger: LoggerService,
  ) {}

  @Get('.well-known/lnurlp/pay')
  getPayMetadata() {
    const minSendable = this.configService.get<number>('MIN_SENDABLE', 1000);
    const maxSendable = this.configService.get<number>(
      'MAX_SENDABLE',
      100000000,
    );
    const commentAllowed = this.configService.get<number>(
      'COMMENT_ALLOWED',
      280,
    );
    const callbackUrl = this.configService.get<string>(
      'LNURL_CALLBACK_URL',
      'https://albyhub.brianstoker.com/lnurl/callback',
    );

    // LUD-16 compliant metadata format
    const metadata = JSON.stringify([
      ['text/plain', 'Pay to Brian Stoker'],
      ['text/identifier', 'pay@brianstoker.com'],
    ]);

    return {
      callback: callbackUrl,
      minSendable,
      maxSendable,
      metadata,
      tag: 'payRequest',
      commentAllowed,
    };
  }

  @Get('lnurl/callback')
  async getCallback(
    @Query() query: LnurlCallbackQueryDto,
  ): Promise<LnurlCallbackResponse | LnurlErrorResponse> {
    try {
      const { amount, comment } = query;

      // Validate amount parameter is present
      if (!amount) {
        this.logger.warn('Callback request missing amount parameter', this.context);
        throw new BadRequestException({
          status: 'ERROR',
          reason: 'Amount parameter is required',
        });
      }

      // Get configuration values
      const minSendable = this.configService.get<number>('MIN_SENDABLE', 1000);
      const maxSendable = this.configService.get<number>(
        'MAX_SENDABLE',
        100000000,
      );
      const commentAllowed = this.configService.get<number>(
        'COMMENT_ALLOWED',
        280,
      );

      // Validate amount is within allowed range
      const amountValidation = this.invoiceService.validateAmount(
        amount,
        minSendable,
        maxSendable,
      );

      if (!amountValidation.isValid) {
        this.logger.warn(
          `Invalid amount: ${amount}. ${amountValidation.reason}`,
          this.context,
        );
        throw new BadRequestException({
          status: 'ERROR',
          reason: amountValidation.reason,
        });
      }

      // Validate comment if provided
      if (comment) {
        const commentValidation = this.invoiceService.validateComment(
          comment,
          commentAllowed,
        );

        if (!commentValidation.isValid) {
          this.logger.warn(
            `Invalid comment length: ${comment.length}. ${commentValidation.reason}`,
            this.context,
          );
          throw new BadRequestException({
            status: 'ERROR',
            reason: commentValidation.reason,
          });
        }

        this.logger.log(
          `Payment callback with comment: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
          this.context,
        );
      }

      // Generate metadata (must match what was returned in getPayMetadata)
      const metadata = JSON.stringify([
        ['text/plain', 'Pay to Brian Stoker'],
        ['text/identifier', 'pay@brianstoker.com'],
      ]);

      // Generate mock invoice
      const invoice = this.invoiceService.generateMockInvoice(
        amount,
        metadata,
        comment,
      );

      this.logger.log(
        `Generated invoice for amount: ${amount} millisats${comment ? ` with comment` : ''}`,
        this.context,
      );

      // Return LUD-06 compliant response
      const response: LnurlCallbackResponse = {
        pr: invoice,
        routes: [],
        successAction: {
          tag: 'message',
          message: 'Payment received! Thank you.',
        },
      };

      return response;
    } catch (error) {
      // If it's already a BadRequestException, rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error('Error generating invoice', error instanceof Error ? error.stack : '', this.context);

      // Return 500 for unexpected errors
      throw new InternalServerErrorException({
        status: 'ERROR',
        reason: 'Failed to generate invoice',
      });
    }
  }
}
