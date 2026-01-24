import { Module } from '@nestjs/common';
import { LnurlController } from './controllers/lnurl.controller';
import { InvoiceService } from './services/invoice.service';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  controllers: [LnurlController],
  providers: [InvoiceService, LoggerService],
})
export class LightningModule {}
