import { Module } from '@nestjs/common';
import { LnurlController } from './controllers/lnurl.controller';
import { WebhookController } from './controllers/webhook.controller';
import { InvoiceService } from './services/invoice.service';
import { PaymentVerificationService } from './services/payment-verification.service';
import { LoggerService } from '../../common/logger/logger.service';
import { SecretsService } from '../../config/secrets.config';
import { NwcModule } from '../nwc/nwc.module';

@Module({
  imports: [NwcModule],
  controllers: [LnurlController, WebhookController],
  providers: [InvoiceService, PaymentVerificationService, LoggerService, SecretsService],
})
export class LightningModule {}
