import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecretsHealthIndicator extends HealthIndicator {
  check(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check if required secrets/environment variables are loaded
      const requiredSecrets = [
        'ALBY_HUB_URL',
        'ALBY_HUB_CLIENT_ID',
        'ALBY_HUB_CLIENT_SECRET',
      ];

      const missingSecrets = requiredSecrets.filter((secret) => !process.env[secret]);

      const isHealthy = missingSecrets.length === 0;

      const result: HealthIndicatorResult = {
        [key]: {
          status: isHealthy ? 'up' : 'down',
          missingSecrets: missingSecrets.length > 0 ? missingSecrets : [],
        },
      };

      if (!isHealthy) {
        throw new HealthCheckError(
          `Missing secrets: ${missingSecrets.join(', ')}`,
          result,
        );
      }

      return Promise.resolve(result);
    } catch (error) {
      const result: HealthIndicatorResult = {
        [key]: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
      throw new HealthCheckError('Secrets health check failed', result);
    }
  }
}
