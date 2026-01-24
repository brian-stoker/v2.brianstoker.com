import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerService } from './common/logger/logger.service';

@Module({
  imports: [
    ConfigModule,
    HealthModule,
  ],
  controllers: [],
  providers: [LoggerService],
})
export class AppModule {}
