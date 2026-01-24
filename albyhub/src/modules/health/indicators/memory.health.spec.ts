import { Test, TestingModule } from '@nestjs/testing';
import { MemoryHealthIndicator } from './memory.health';
import { HealthCheckError } from '@nestjs/terminus';

describe('MemoryHealthIndicator', () => {
  let indicator: MemoryHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryHealthIndicator],
    }).compile();

    indicator = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
  });

  it('should be defined', () => {
    expect(indicator).toBeDefined();
  });

  describe('check', () => {
    it('should return memory status', async () => {
      const result = await indicator.check('memory');
      expect(result).toHaveProperty('memory');
      expect(result.memory).toHaveProperty('status');
      expect(['up', 'down']).toContain(result.memory.status);
    });

    it('should include heap usage information', async () => {
      const result = await indicator.check('memory');
      expect(result.memory).toHaveProperty('heapUsedMB');
      expect(result.memory).toHaveProperty('heapTotalMB');
      expect(result.memory).toHaveProperty('threshold');
      expect(result.memory.threshold).toBe(500);
    });

    it('should return up status when heap usage is below threshold', async () => {
      const result = await indicator.check('memory');
      expect(result.memory.heapUsedMB).toBeLessThan(500);
      expect(result.memory.status).toBe('up');
    });

    it('should include correct threshold value', async () => {
      const result = await indicator.check('memory');
      expect(result.memory.threshold).toBe(500);
    });
  });
});
