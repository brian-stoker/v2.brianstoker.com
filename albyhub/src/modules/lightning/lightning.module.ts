import { Module } from '@nestjs/common';
import { LnurlController } from './controllers/lnurl.controller';

@Module({
  controllers: [LnurlController],
})
export class LightningModule {}
