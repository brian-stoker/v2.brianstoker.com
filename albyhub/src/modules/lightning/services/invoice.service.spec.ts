import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { NwcWalletService } from '../../nwc/services/nwc-wallet.service';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let nwcWallet: jest.Mocked<NwcWalletService>;

  beforeEach(async () => {
    // Create mock NWC wallet service
    nwcWallet = {
      makeInvoice: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: NwcWalletService, useValue: nwcWallet },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateInvoice', () => {
    const metadata = JSON.stringify([
      ['text/plain', 'Pay to Brian Stoker'],
      ['text/identifier', 'pay@brianstoker.com'],
    ]);

    const mockInvoiceResult = {
      invoice: 'lnbc10n1pjx9qkhpp5example...',
      payment_hash:
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      expires_at: Math.floor(Date.now() / 1000) + 600,
    };

    it('should generate invoice via NWC in <3s (Test-3.2.a)', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      const startTime = Date.now();
      const result = await service.generateInvoice(10000, metadata);
      const duration = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(result.bolt11).toBe(mockInvoiceResult.invoice);
      expect(duration).toBeLessThan(3000);
    });

    it('should validate payment hash is 64-char hex string (Test-3.2.b)', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      const result = await service.generateInvoice(10000, metadata);

      expect(result.payment_hash).toMatch(/^[0-9a-f]{64}$/i);
      expect(result.payment_hash.length).toBe(64);
      expect(result.payment_hash).toBe(mockInvoiceResult.payment_hash);
    });

    it('should set expiry to current_time + 600 seconds (Test-3.2.c)', async () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const expectedExpiry = currentTime + 600;

      const mockResult = {
        ...mockInvoiceResult,
        expires_at: expectedExpiry,
      };

      nwcWallet.makeInvoice.mockResolvedValue(mockResult);

      const result = await service.generateInvoice(10000, metadata);

      expect(result.expires_at).toBe(expectedExpiry);
      // Verify it's approximately 10 minutes from now
      expect(result.expires_at - currentTime).toBeGreaterThanOrEqual(595);
      expect(result.expires_at - currentTime).toBeLessThanOrEqual(605);
    });

    it('should include comment in invoice description (Test-3.2.d)', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata, 'test payment');

      expect(nwcWallet.makeInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          description: expect.stringContaining('test payment'),
          expiry: 600,
        }),
      );
    });

    it('should propagate Voltage error with message (Test-3.2.e)', async () => {
      nwcWallet.makeInvoice.mockRejectedValue(
        new Error('Insufficient liquidity: Not enough inbound capacity'),
      );

      await expect(
        service.generateInvoice(1000000, metadata),
      ).rejects.toThrow(/insufficient liquidity/i);
    });

    it(
      'should timeout after 30s when mock does not respond (Test-3.2.f)',
      async () => {
        nwcWallet.makeInvoice.mockImplementation(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout: make_invoice')), 30000);
          });
        });

        const startTime = Date.now();

        await expect(
          service.generateInvoice(10000, metadata),
        ).rejects.toThrow(/timeout/i);

        const duration = Date.now() - startTime;
        expect(duration).toBeGreaterThanOrEqual(30000);
      },
      35000,
    );

    it('should hash metadata per LNURL spec', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata);

      expect(nwcWallet.makeInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringMatching(/\[.+\.\.\.\]/),
        }),
      );
    });

    it('should include metadata hash in description', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata);

      const call = nwcWallet.makeInvoice.mock.calls[0][0];
      expect(call.description).toContain('[');
      expect(call.description).toContain('...]');
    });

    it('should create description with comment and metadata hash', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata, 'My payment');

      const call = nwcWallet.makeInvoice.mock.calls[0][0];
      expect(call.description).toContain('My payment');
      expect(call.description).toContain('[');
    });

    it('should create description without comment', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata);

      const call = nwcWallet.makeInvoice.mock.calls[0][0];
      expect(call.description).toMatch(/^Payment \[.+\.\.\.\]$/);
    });

    it('should set expiry to 600 seconds', async () => {
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata);

      expect(nwcWallet.makeInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          expiry: 600,
        }),
      );
    });

    it('should handle invoice generation errors gracefully', async () => {
      nwcWallet.makeInvoice.mockRejectedValue(new Error('Network error'));

      await expect(
        service.generateInvoice(10000, metadata),
      ).rejects.toThrow('Network error');
    });

    it('should log invoice generation success', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');
      nwcWallet.makeInvoice.mockResolvedValue(mockInvoiceResult);

      await service.generateInvoice(10000, metadata);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Invoice generated in \d+ms/),
        expect.any(Object),
      );
    });

    it('should log invoice generation errors', async () => {
      const errorSpy = jest.spyOn(service['logger'], 'error');
      nwcWallet.makeInvoice.mockRejectedValue(new Error('Test error'));

      await expect(
        service.generateInvoice(10000, metadata),
      ).rejects.toThrow();

      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('generateMockInvoice', () => {
    it('should generate a valid bolt11-like invoice', () => {
      const amount = 10000;
      const description = 'test payment';
      const invoice = service.generateMockInvoice(amount, description);

      expect(invoice).toBeDefined();
      expect(typeof invoice).toBe('string');
      expect(invoice).toMatch(/^lnbc/);
      expect(invoice.length).toBeGreaterThan(20);
    });

    it('should include amount in satoshis in the invoice', () => {
      const amountMillisats = 10000; // 10 sats
      const description = 'test payment';
      const invoice = service.generateMockInvoice(amountMillisats, description);

      const amountSats = Math.floor(amountMillisats / 1000);
      expect(invoice).toContain(`${amountSats}n`);
    });

    it('should generate different invoices for different amounts', () => {
      const description = 'test payment';
      const invoice1 = service.generateMockInvoice(10000, description);
      const invoice2 = service.generateMockInvoice(20000, description);

      expect(invoice1).not.toBe(invoice2);
    });

    it('should generate different invoices at different times', () => {
      const amount = 10000;
      const description = 'test payment';
      const invoice1 = service.generateMockInvoice(amount, description);

      // Small delay to ensure different timestamp
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait 10ms
      }

      const invoice2 = service.generateMockInvoice(amount, description);

      expect(invoice1).not.toBe(invoice2);
    });

    it('should generate different invoices with different comments', () => {
      const amount = 10000;
      const description = 'test payment';
      const invoice1 = service.generateMockInvoice(amount, description, 'comment1');
      const invoice2 = service.generateMockInvoice(amount, description, 'comment2');

      expect(invoice1).not.toBe(invoice2);
    });

    it('should handle optional comment parameter', () => {
      const amount = 10000;
      const description = 'test payment';
      const invoiceWithComment = service.generateMockInvoice(
        amount,
        description,
        'test comment',
      );
      const invoiceWithoutComment = service.generateMockInvoice(
        amount,
        description,
      );

      expect(invoiceWithComment).toBeDefined();
      expect(invoiceWithoutComment).toBeDefined();
      expect(invoiceWithComment).not.toBe(invoiceWithoutComment);
    });

    it('should handle large amounts', () => {
      const amount = 100000000; // 100k sats in millisats
      const description = 'large payment';
      const invoice = service.generateMockInvoice(amount, description);

      expect(invoice).toBeDefined();
      expect(invoice).toMatch(/^lnbc/);
    });

    it('should handle minimum amounts', () => {
      const amount = 1000; // 1 sat in millisats
      const description = 'minimum payment';
      const invoice = service.generateMockInvoice(amount, description);

      expect(invoice).toBeDefined();
      expect(invoice).toMatch(/^lnbc/);
    });
  });

  describe('validateAmount', () => {
    it('should return valid for amount within range', () => {
      const result = service.validateAmount(10000, 1000, 100000000);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return invalid for amount below minimum', () => {
      const result = service.validateAmount(500, 1000, 100000000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('below minimum');
    });

    it('should return invalid for amount above maximum', () => {
      const result = service.validateAmount(200000000, 1000, 100000000);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('exceeds maximum');
    });

    it('should return valid for amount at minimum boundary', () => {
      const minSendable = 1000;
      const result = service.validateAmount(minSendable, minSendable, 100000000);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return valid for amount at maximum boundary', () => {
      const maxSendable = 100000000;
      const result = service.validateAmount(maxSendable, 1000, maxSendable);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should include amount in error reason', () => {
      const amount = 500;
      const result = service.validateAmount(amount, 1000, 100000000);

      expect(result.reason).toContain(amount.toString());
    });
  });

  describe('validateComment', () => {
    it('should return valid for comment within length', () => {
      const result = service.validateComment('test comment', 280);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return valid for undefined comment', () => {
      const result = service.validateComment(undefined, 280);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return invalid for comment exceeding max length', () => {
      const comment = 'a'.repeat(281);
      const result = service.validateComment(comment, 280);

      expect(result.isValid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('exceeds maximum');
    });

    it('should return valid for comment at exact max length', () => {
      const comment = 'a'.repeat(280);
      const result = service.validateComment(comment, 280);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return valid for empty comment', () => {
      const result = service.validateComment('', 280);

      expect(result.isValid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should include comment length in error reason', () => {
      const comment = 'a'.repeat(281);
      const result = service.validateComment(comment, 280);

      expect(result.reason).toContain('281');
      expect(result.reason).toContain('280');
    });

    it('should use default max length of 280', () => {
      const comment = 'a'.repeat(281);
      const result = service.validateComment(comment);

      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('280');
    });
  });
});
