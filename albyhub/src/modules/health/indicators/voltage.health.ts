import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';

@Injectable()
export class VoltageHealthIndicator extends HealthIndicator {
  async check(key: string): Promise<HealthIndicatorResult> {
    try {
      // For now, we'll use a mock implementation
      // In Phase 3, this will be replaced with actual Voltage API ping
      const isHealthy = await this.pingVoltageAPI();

      const result: HealthIndicatorResult = {
        [key]: {
          status: isHealthy ? 'up' : 'down',
        },
      };

      if (!isHealthy) {
        throw new HealthCheckError('Voltage API is unreachable', result);
      }

      return result;
    } catch (error) {
      const result: HealthIndicatorResult = {
        [key]: {
          status: 'down',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
      throw new HealthCheckError('Voltage API health check failed', result);
    }
  }

  private async pingVoltageAPI(): Promise<boolean> {
    // Mock implementation - always healthy
    // This will be replaced with actual HTTP ping in Phase 3
    const voltageUrl = process.env.VOLTAGE_API_URL;

    if (!voltageUrl) {
      // If no URL configured, consider it unhealthy
      return false;
    }

    try {
      // Simulate API call
      await this.simulateApiCall();
      return true;
    } catch {
      return false;
    }
  }

  private async simulateApiCall(): Promise<void> {
    // Simulate a 10ms API call
    return new Promise((resolve) => setTimeout(resolve, 10));
  }
}
