import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceService],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
