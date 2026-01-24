import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { VoltageHealthIndicator } from './indicators/voltage.health';
import { SecretsHealthIndicator } from './indicators/secrets.health';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    MemoryHealthIndicator,
    VoltageHealthIndicator,
    SecretsHealthIndicator,
  ],
})
export class HealthModule {}
