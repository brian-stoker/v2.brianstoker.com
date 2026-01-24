import { Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { MemoryHealthIndicator } from './indicators/memory.health';
import { VoltageHealthIndicator } from './indicators/voltage.health';
import { SecretsHealthIndicator } from './indicators/secrets.health';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private voltage: VoltageHealthIndicator,
    private secrets: SecretsHealthIndicator,
  ) {}

  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0',
    };
  }

  async checkReady() {
    return this.health.check([
      () => this.memory.check('memory'),
      () => this.voltage.check('voltage'),
      () => this.secrets.check('secrets'),
    ]);
  }
}
