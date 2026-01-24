import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';
import { LightningModule } from './modules/lightning/lightning.module';
import { NwcModule } from './modules/nwc/nwc.module';
import { LoggerService } from './common/logger/logger.service';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    LightningModule,
    NwcModule,
  ],
  controllers: [],
  providers: [LoggerService],
})
export class AppModule {}
