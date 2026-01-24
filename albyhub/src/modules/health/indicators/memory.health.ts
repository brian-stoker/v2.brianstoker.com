import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly HEAP_THRESHOLD_MB = 500; // 500 MB threshold (allows for test environments)

  check(key: string): Promise<HealthIndicatorResult> {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    const isHealthy = heapUsedMB < this.HEAP_THRESHOLD_MB;

    const result: HealthIndicatorResult = {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        heapUsedMB,
        heapTotalMB,
        threshold: this.HEAP_THRESHOLD_MB,
      },
    };

    if (!isHealthy) {
      throw new HealthCheckError(
        `Heap memory exceeds threshold: ${heapUsedMB}MB > ${this.HEAP_THRESHOLD_MB}MB`,
        result,
      );
    }

    return Promise.resolve(result);
  }
}
