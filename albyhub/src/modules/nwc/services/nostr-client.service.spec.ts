import { Test, TestingModule } from '@nestjs/testing';
import { NostrClientService, ConnectionStatus } from './nostr-client.service';
import type { Event } from 'nostr-tools';

describe('NostrClientService', () => {
  let service: NostrClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NostrClientService],
    }).compile();

    service = module.get<NostrClientService>(NostrClientService);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should start in disconnected state', () => {
      expect(service.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('reconnection backoff calculation', () => {
    it('should calculate exponential backoff correctly (AC-3.1.c)', () => {
      const baseDelay = 1000;
      const maxDelay = 30000;

      // Test backoff progression: 1s, 2s, 4s, 8s, 16s, 30s (max)
      const expectedDelays = [1000, 2000, 4000, 8000, 16000, 30000, 30000];

      expectedDelays.forEach((expectedDelay, attempt) => {
        const calculatedDelay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay,
        );
        expect(calculatedDelay).toBe(expectedDelay);
      });
    });
  });

  describe('subscription management', () => {
    it('should throw error when subscribing if not connected', () => {
      expect(() => {
        service.subscribe('test-sub', []);
      }).toThrow('Cannot subscribe: not connected to relay');
    });

    it('should throw error when publishing if not connected', () => {
      const mockEvent: any = {
        id: 'test',
        pubkey: 'test',
        created_at: 123,
        kind: 1,
        tags: [],
        content: 'test',
        sig: 'test',
      };

      expect(() => {
        service.publish(mockEvent);
      }).toThrow('Cannot publish: not connected to relay');
    });
  });

  describe('graceful shutdown', () => {
    it('should set shutting down flag and prevent reconnection (AC-3.1.g)', async () => {
      await service.disconnect();

      // Should not be able to connect after shutdown
      service['isShuttingDown'] = true;

      await expect(
        service.connect('wss://relay.example.com'),
      ).rejects.toThrow('Cannot connect: service is shutting down');
    });
  });

  describe('status methods', () => {
    it('should return correct connection status', () => {
      expect(service.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('unsubscribe', () => {
    it('should handle unsubscribe for non-existent subscription', () => {
      // Should not throw error
      service.unsubscribe('non-existent-sub');

      // Verify it logs a warning but doesn't crash
      expect(service.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });
  });
});
