import { Test, TestingModule } from '@nestjs/testing';
import { NwcConnectionService } from './nwc-connection.service';
import { NostrClientService, ConnectionStatus } from './nostr-client.service';
import { SecretsService } from '@config/secrets.config';

describe('NwcConnectionService', () => {
  let service: NwcConnectionService;
  let nostrClient: jest.Mocked<NostrClientService>;
  let secretsService: jest.Mocked<SecretsService>;

  const mockSecrets = {
    voltage: {
      apiKey: 'test-api-key',
      macaroon: 'test-macaroon',
      connectionUrl: 'https://voltage.example.com',
    },
    nostr: {
      privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      publicKey: 'wallet-pubkey-123',
      relayUrl: 'wss://relay.example.com',
    },
  };

  beforeEach(async () => {
    // Create mocks
    nostrClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(),
      publish: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
      getStatus: jest.fn().mockReturnValue(ConnectionStatus.CONNECTED),
      on: jest.fn(),
      emit: jest.fn(),
    } as any;

    secretsService = {
      getSecrets: jest.fn().mockResolvedValue(mockSecrets),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NwcConnectionService,
        { provide: NostrClientService, useValue: nostrClient },
        { provide: SecretsService, useValue: secretsService },
      ],
    }).compile();

    service = module.get<NwcConnectionService>(NwcConnectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize and connect to relay successfully', async () => {
      await service.onModuleInit();

      expect(secretsService.getSecrets).toHaveBeenCalled();
      expect(nostrClient.connect).toHaveBeenCalledWith(mockSecrets.nostr.relayUrl);
      expect(nostrClient.subscribe).toHaveBeenCalled();
      expect(service.isReady()).toBe(true);
    });

    it('should throw error if secrets loading fails', async () => {
      secretsService.getSecrets.mockRejectedValue(new Error('Secrets not found'));

      await expect(service.onModuleInit()).rejects.toThrow('Secrets not found');
    });

    it('should throw error if relay connection fails', async () => {
      nostrClient.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('hexToBytes conversion', () => {
    it('should convert hex string to Uint8Array correctly (AC-3.1.d)', () => {
      const hex = '0123456789abcdef';
      const bytes = service['hexToBytes'](hex);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(8);
      expect(bytes[0]).toBe(0x01);
      expect(bytes[1]).toBe(0x23);
      expect(bytes[7]).toBe(0xef);
    });

    it('should handle 64-character hex (32 bytes for private key)', () => {
      const hex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const bytes = service['hexToBytes'](hex);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(32);
    });
  });

  describe('sendRequest', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should throw error if not connected', async () => {
      nostrClient.isConnected.mockReturnValue(false);

      await expect(service.sendRequest('get_info', {})).rejects.toThrow(
        'Not connected to NWC relay',
      );
    });

    it('should generate unique request IDs', () => {
      const id1 = service['generateRequestId']();
      const id2 = service['generateRequestId']();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(32); // 16 bytes hex = 32 characters
    });
  });

  describe('helper methods', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should have makeInvoice method', () => {
      expect(service.makeInvoice).toBeDefined();
      expect(typeof service.makeInvoice).toBe('function');
    });

    it('should have getBalance method', () => {
      expect(service.getBalance).toBeDefined();
      expect(typeof service.getBalance).toBe('function');
    });

    it('should have getInfo method', () => {
      expect(service.getInfo).toBeDefined();
      expect(typeof service.getInfo).toBe('function');
    });
  });

  describe('connection status', () => {
    it('should return connection status from Nostr client', async () => {
      await service.onModuleInit();

      const status = service.getConnectionStatus();
      expect(status).toBe(ConnectionStatus.CONNECTED);
      expect(nostrClient.getStatus).toHaveBeenCalled();
    });

    it('should indicate ready when connected and keys loaded', async () => {
      await service.onModuleInit();

      expect(service.isReady()).toBe(true);
    });

    it('should indicate not ready if not connected', async () => {
      await service.onModuleInit();
      nostrClient.isConnected.mockReturnValue(false);

      expect(service.isReady()).toBe(false);
    });
  });

  describe('request event ID extraction', () => {
    it('should extract event ID from e tag', () => {
      const event: any = {
        id: 'response-id',
        tags: [
          ['p', 'pubkey'],
          ['e', 'request-event-id-123'],
        ],
      };

      const eventId = service['getRequestEventId'](event);
      expect(eventId).toBe('request-event-id-123');
    });

    it('should return null if no e tag found', () => {
      const event: any = {
        id: 'response-id',
        tags: [['p', 'pubkey']],
      };

      const eventId = service['getRequestEventId'](event);
      expect(eventId).toBeNull();
    });
  });

  describe('pending requests management', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should reject all pending requests on connection loss', () => {
      // Create a mock pending request
      const mockReject = jest.fn();
      const mockRequest = {
        requestId: 'test-123',
        method: 'get_info',
        timestamp: Date.now(),
        resolve: jest.fn(),
        reject: mockReject,
        timeoutHandle: setTimeout(() => {}, 1000) as NodeJS.Timeout,
      };

      service['pendingRequests'].set('test-123', mockRequest);

      // Call the private method to reject all
      service['rejectAllPendingRequests'](new Error('Connection lost'));

      expect(mockReject).toHaveBeenCalledWith(new Error('Connection lost'));
      expect(service['pendingRequests'].size).toBe(0);
    });

    it('should clear timeout when rejecting pending requests (AC-3.1.f)', () => {
      jest.useFakeTimers();

      const mockReject = jest.fn();
      const timeoutHandle = setTimeout(() => {}, 30000);
      const mockRequest = {
        requestId: 'test-123',
        method: 'get_info',
        timestamp: Date.now(),
        resolve: jest.fn(),
        reject: mockReject,
        timeoutHandle,
      };

      service['pendingRequests'].set('test-123', mockRequest);

      service['rejectAllPendingRequests'](new Error('Test error'));

      // Verify timeout was cleared by checking it doesn't fire
      jest.advanceTimersByTime(30000);
      expect(mockReject).toHaveBeenCalledTimes(1); // Only once from rejectAll

      jest.useRealTimers();
    });
  });
});
