import { Test, TestingModule } from '@nestjs/testing';
import { NwcWalletService } from './nwc-wallet.service';
import { NwcConnectionService, NwcResponse } from './nwc-connection.service';

describe('NwcWalletService', () => {
  let service: NwcWalletService;
  let nwcConnection: jest.Mocked<NwcConnectionService>;

  beforeEach(async () => {
    // Create mock NWC connection
    nwcConnection = {
      isReady: jest.fn().mockReturnValue(true),
      sendRequest: jest.fn(),
      getBalance: jest.fn(),
      getInfo: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NwcWalletService,
        { provide: NwcConnectionService, useValue: nwcConnection },
      ],
    }).compile();

    service = module.get<NwcWalletService>(NwcWalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('makeInvoice', () => {
    const validResponse: NwcResponse = {
      result_type: 'make_invoice',
      result: {
        invoice:
          'lnbc10n1pjx9qkhpp5example...',
        payment_hash:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        expires_at: Math.floor(Date.now() / 1000) + 600,
      },
    };

    it('should generate invoice successfully (AC-3.2.a)', async () => {
      const startTime = Date.now();
      nwcConnection.sendRequest.mockResolvedValue(validResponse);

      const result = await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(result.invoice).toBe(validResponse.result.invoice);
      expect(result.payment_hash).toBe(validResponse.result.payment_hash);
      expect(result.expires_at).toBe(validResponse.result.expires_at);
      expect(duration).toBeLessThan(3000);
    });

    it('should validate payment hash is 64-char hex string (AC-3.2.b)', async () => {
      nwcConnection.sendRequest.mockResolvedValue(validResponse);

      const result = await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      expect(result.payment_hash).toMatch(/^[0-9a-f]{64}$/i);
      expect(result.payment_hash.length).toBe(64);
    });

    it('should set expiry to 600 seconds from creation (AC-3.2.c)', async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const response = {
        ...validResponse,
        result: {
          ...validResponse.result,
          expires_at: currentTime + 600,
        },
      };

      nwcConnection.sendRequest.mockResolvedValue(response);

      const result = await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      // Verify expiry is approximately 600 seconds from now
      const expectedExpiry = currentTime + 600;
      expect(result.expires_at).toBeGreaterThanOrEqual(expectedExpiry - 5);
      expect(result.expires_at).toBeLessThanOrEqual(expectedExpiry + 5);
    });

    it('should include comment in description (AC-3.2.d)', async () => {
      nwcConnection.sendRequest.mockResolvedValue(validResponse);

      await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      expect(nwcConnection.sendRequest).toHaveBeenCalledWith(
        'make_invoice',
        expect.objectContaining({
          description: 'test payment',
        }),
      );
    });

    it('should propagate Voltage API errors with clear message (AC-3.2.e)', async () => {
      const errorResponse: NwcResponse = {
        result_type: 'make_invoice',
        error: {
          code: 'INSUFFICIENT_LIQUIDITY',
          message: 'Not enough inbound liquidity',
        },
      };

      nwcConnection.sendRequest.mockResolvedValue(errorResponse);

      await expect(
        service.makeInvoice({
          amount: 10000,
          description: 'test payment',
        }),
      ).rejects.toThrow(/insufficient liquidity/i);
    });

    it(
      'should timeout after 30s when NWC does not respond (AC-3.2.f)',
      async () => {
        // Mock a timeout by rejecting after delay
        nwcConnection.sendRequest.mockImplementation(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout: make_invoice')), 30000);
          });
        });

        const startTime = Date.now();

        await expect(
          service.makeInvoice({
            amount: 10000,
            description: 'test payment',
          }),
        ).rejects.toThrow(/timeout/i);

        const duration = Date.now() - startTime;
        expect(duration).toBeGreaterThanOrEqual(30000);
      },
      35000,
    );

    it('should retry network errors up to 3 times (AC-3.2.g)', async () => {
      let attemptCount = 0;

      nwcConnection.sendRequest.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error: ECONNREFUSED'));
        }
        return Promise.resolve(validResponse);
      });

      const result = await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      expect(attemptCount).toBe(3);
      expect(result.invoice).toBeDefined();
    });

    it('should return liquidity error when amount exceeds available (AC-3.2.h)', async () => {
      const errorResponse: NwcResponse = {
        result_type: 'make_invoice',
        error: {
          code: 'INSUFFICIENT_LIQUIDITY',
          message: 'Requested amount 1000000 msats exceeds available liquidity',
        },
      };

      nwcConnection.sendRequest.mockResolvedValue(errorResponse);

      await expect(
        service.makeInvoice({
          amount: 1000000,
          description: 'large payment',
        }),
      ).rejects.toThrow(/insufficient liquidity/i);
    });

    it('should throw error if NWC connection not ready', async () => {
      nwcConnection.isReady.mockReturnValue(false);

      await expect(
        service.makeInvoice({
          amount: 10000,
          description: 'test payment',
        }),
      ).rejects.toThrow('NWC connection not ready');
    });

    it('should reject invalid payment hash format', async () => {
      const invalidResponse = {
        ...validResponse,
        result: {
          ...validResponse.result,
          payment_hash: 'invalid-hash',
        },
      };

      nwcConnection.sendRequest.mockResolvedValue(invalidResponse);

      await expect(
        service.makeInvoice({
          amount: 10000,
          description: 'test payment',
        }),
      ).rejects.toThrow(/Invalid payment_hash format/);
    });

    it('should not retry permanent errors', async () => {
      const errorResponse: NwcResponse = {
        result_type: 'make_invoice',
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be positive',
        },
      };

      nwcConnection.sendRequest.mockResolvedValue(errorResponse);

      await expect(
        service.makeInvoice({
          amount: 0,
          description: 'test payment',
        }),
      ).rejects.toThrow(/invalid amount/i);

      // Should only call once, no retries
      expect(nwcConnection.sendRequest).toHaveBeenCalledTimes(1);
    });

    it('should handle custom expiry parameter', async () => {
      nwcConnection.sendRequest.mockResolvedValue(validResponse);

      await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
        expiry: 300, // 5 minutes
      });

      expect(nwcConnection.sendRequest).toHaveBeenCalledWith(
        'make_invoice',
        expect.objectContaining({
          expiry: 300,
        }),
      );
    });

    it('should default to 600 second expiry', async () => {
      nwcConnection.sendRequest.mockResolvedValue(validResponse);

      await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      expect(nwcConnection.sendRequest).toHaveBeenCalledWith(
        'make_invoice',
        expect.objectContaining({
          expiry: 600,
        }),
      );
    });
  });

  describe('retry logic', () => {
    const validResponse: NwcResponse = {
      result_type: 'make_invoice',
      result: {
        invoice: 'lnbc10n1pjx9qkhpp5example...',
        payment_hash:
          '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        expires_at: Math.floor(Date.now() / 1000) + 600,
      },
    };

    it('should implement exponential backoff (Test-3.2.g)', async () => {
      const delays: number[] = [];
      let attemptCount = 0;
      let lastTime = Date.now();

      nwcConnection.sendRequest.mockImplementation(() => {
        const now = Date.now();
        if (attemptCount > 0) {
          delays.push(now - lastTime);
        }
        lastTime = now;
        attemptCount++;

        if (attemptCount < 3) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve(validResponse);
      });

      await service.makeInvoice({
        amount: 10000,
        description: 'test payment',
      });

      // Verify exponential backoff pattern
      expect(delays.length).toBe(2);
      expect(delays[0]).toBeGreaterThanOrEqual(100); // First retry ~100ms
      expect(delays[1]).toBeGreaterThanOrEqual(200); // Second retry ~200ms
      expect(delays[1]).toBeGreaterThan(delays[0]); // Each delay increases
    });

    it('should not exceed max retries', async () => {
      let attemptCount = 0;

      nwcConnection.sendRequest.mockImplementation(() => {
        attemptCount++;
        return Promise.reject(new Error('Network error'));
      });

      await expect(
        service.makeInvoice({
          amount: 10000,
          description: 'test payment',
        }),
      ).rejects.toThrow();

      // Should try once + 3 retries = 4 total attempts
      expect(attemptCount).toBe(4);
    });

    it('should identify transient vs permanent errors', () => {
      // Transient errors (should retry)
      expect(service['shouldRetry'](new Error('Network timeout'))).toBe(true);
      expect(service['shouldRetry'](new Error('ECONNREFUSED'))).toBe(true);
      expect(service['shouldRetry'](new Error('Rate limited'))).toBe(true);

      // Permanent errors (should not retry)
      expect(service['shouldRetry'](new Error('Insufficient liquidity'))).toBe(
        false,
      );
      expect(service['shouldRetry'](new Error('Invalid amount'))).toBe(false);
      expect(service['shouldRetry'](new Error('Unauthorized'))).toBe(false);
    });
  });

  describe('error mapping', () => {
    it('should map NWC error codes to user-friendly messages', () => {
      const testCases = [
        {
          error: { code: 'INSUFFICIENT_LIQUIDITY', message: 'Not enough funds' },
          expected: /insufficient liquidity/i,
        },
        {
          error: { code: 'INVALID_AMOUNT', message: 'Amount too small' },
          expected: /invalid amount/i,
        },
        {
          error: { code: 'RATE_LIMITED', message: 'Too many requests' },
          expected: /rate limited/i,
        },
        {
          error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
          expected: /unauthorized/i,
        },
      ];

      for (const testCase of testCases) {
        const mapped = service['mapNwcError'](testCase.error);
        expect(mapped).toMatch(testCase.expected);
      }
    });
  });

  describe('getBalance', () => {
    it('should return balance from wallet', async () => {
      const balanceResponse: NwcResponse = {
        result_type: 'get_balance',
        result: {
          balance: 50000000, // 50k sats in msats
        },
      };

      nwcConnection.getBalance.mockResolvedValue(balanceResponse);

      const balance = await service.getBalance();

      expect(balance).toBe(50000000);
    });

    it('should throw error on balance fetch failure', async () => {
      const errorResponse: NwcResponse = {
        result_type: 'get_balance',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch balance',
        },
      };

      nwcConnection.getBalance.mockResolvedValue(errorResponse);

      await expect(service.getBalance()).rejects.toThrow(/Failed to get balance/);
    });
  });

  describe('getInfo', () => {
    it('should return wallet info', async () => {
      const infoResponse: NwcResponse = {
        result_type: 'get_info',
        result: {
          alias: 'My Voltage Node',
          color: '#3399ff',
          pubkey: 'node-pubkey-123',
          network: 'bitcoin',
          block_height: 800000,
          block_hash: 'block-hash-123',
        },
      };

      nwcConnection.getInfo.mockResolvedValue(infoResponse);

      const info = await service.getInfo();

      expect(info).toBeDefined();
      expect(info.alias).toBe('My Voltage Node');
      expect(info.network).toBe('bitcoin');
    });

    it('should throw error on info fetch failure', async () => {
      const errorResponse: NwcResponse = {
        result_type: 'get_info',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch info',
        },
      };

      nwcConnection.getInfo.mockResolvedValue(errorResponse);

      await expect(service.getInfo()).rejects.toThrow(/Failed to get info/);
    });
  });
});
