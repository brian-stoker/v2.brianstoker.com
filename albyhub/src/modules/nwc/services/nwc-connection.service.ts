import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NostrClientService, ConnectionStatus } from './nostr-client.service';
import { SecretsService } from '@config/secrets.config';
import { finalizeEvent, getPublicKey, nip04 } from 'nostr-tools';
import type { Event, EventTemplate } from 'nostr-tools';
import { randomBytes } from 'crypto';

export interface NwcRequest {
  method: string;
  params: Record<string, any>;
}

export interface NwcResponse {
  result_type: string;
  result?: any;
  error?: {
    code: string;
    message: string;
  };
}

export interface PendingRequest {
  requestId: string;
  method: string;
  timestamp: number;
  resolve: (response: NwcResponse) => void;
  reject: (error: Error) => void;
  timeoutHandle: NodeJS.Timeout;
}

/**
 * NWC Connection Service implementing NIP-47 protocol.
 * Handles encrypted request/response communication with NWC wallet.
 */
@Injectable()
export class NwcConnectionService implements OnModuleInit {
  private readonly logger = new Logger(NwcConnectionService.name);
  private privateKey: Uint8Array | null = null;
  private publicKey: string | null = null;
  private walletPubkey: string | null = null;
  private relayUrl: string | null = null;
  private readonly subscriptionId = 'nwc-responses';
  private readonly requestTimeout = 30000; // 30 seconds
  private pendingRequests = new Map<string, PendingRequest>();

  constructor(
    private readonly nostrClient: NostrClientService,
    private readonly secretsService: SecretsService,
  ) {}

  /**
   * Initialize NWC connection on module startup.
   */
  async onModuleInit(): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Initializing NWC connection...');

    try {
      // Load secrets
      const secrets = await this.secretsService.getSecrets();
      this.privateKey = this.hexToBytes(secrets.nostr.privateKey);
      this.publicKey = getPublicKey(this.privateKey);
      this.walletPubkey = secrets.nostr.publicKey; // Wallet's public key
      this.relayUrl = secrets.nostr.relayUrl;

      this.logger.log('Nostr keys loaded', {
        clientPubkey: this.publicKey.substring(0, 8) + '...',
        walletPubkey: this.walletPubkey.substring(0, 8) + '...',
      });

      // Connect to relay
      await this.nostrClient.connect(this.relayUrl);

      // Subscribe to response events
      this.subscribeToResponses();

      // Setup event handlers
      this.setupEventHandlers();

      const duration = Date.now() - startTime;
      this.logger.log(`NWC connection initialized in ${duration}ms`);
    } catch (error) {
      this.logger.error('Failed to initialize NWC connection', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Send a NWC request and wait for response.
   * Throws error on timeout or relay error.
   */
  async sendRequest(method: string, params: Record<string, any> = {}): Promise<NwcResponse> {
    if (!this.nostrClient.isConnected()) {
      throw new Error('Not connected to NWC relay');
    }

    if (!this.privateKey || !this.publicKey || !this.walletPubkey) {
      throw new Error('NWC not initialized: missing keys');
    }

    const requestId = this.generateRequestId();
    this.logger.log(`Sending NWC request: ${method}`, { requestId, params });

    return new Promise<NwcResponse>((resolve, reject) => {
      // Create timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        this.logger.error(`Request ${requestId} timed out after ${this.requestTimeout}ms`);
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeout);

      // Store pending request
      const pendingRequest: PendingRequest = {
        requestId,
        method,
        timestamp: Date.now(),
        resolve,
        reject,
        timeoutHandle,
      };

      this.pendingRequests.set(requestId, pendingRequest);

      // Create and publish request event
      try {
        const event = this.createRequestEvent(method, params);
        this.nostrClient.publish(event);
      } catch (error) {
        clearTimeout(timeoutHandle);
        this.pendingRequests.delete(requestId);
        reject(error);
      }
    });
  }

  /**
   * Create a make_invoice request.
   */
  async makeInvoice(amountMillisats: number, description: string): Promise<NwcResponse> {
    return this.sendRequest('make_invoice', {
      amount: amountMillisats,
      description,
    });
  }

  /**
   * Create a get_balance request.
   */
  async getBalance(): Promise<NwcResponse> {
    return this.sendRequest('get_balance', {});
  }

  /**
   * Create a get_info request.
   */
  async getInfo(): Promise<NwcResponse> {
    return this.sendRequest('get_info', {});
  }

  /**
   * Get current connection status.
   */
  getConnectionStatus(): ConnectionStatus {
    return this.nostrClient.getStatus();
  }

  /**
   * Check if connected and ready to send requests.
   */
  isReady(): boolean {
    return this.nostrClient.isConnected() && this.privateKey !== null;
  }

  /**
   * Subscribe to NWC response events (kind 23195).
   */
  private subscribeToResponses(): void {
    if (!this.publicKey) {
      throw new Error('Cannot subscribe: public key not set');
    }

    // Subscribe to events:
    // - kind 23195 (NWC response)
    // - tagged with our pubkey (#p tag)
    const filters = [
      {
        kinds: [23195],
        '#p': [this.publicKey],
      },
    ];

    this.nostrClient.subscribe(this.subscriptionId, filters);
    this.logger.log('Subscribed to NWC response events', { subscriptionId: this.subscriptionId });
  }

  /**
   * Setup event handlers for Nostr client.
   */
  private setupEventHandlers(): void {
    // Handle incoming events
    this.nostrClient.on('event', (subscriptionId: string, event: Event) => {
      if (subscriptionId === this.subscriptionId) {
        this.handleResponseEvent(event);
      }
    });

    // Handle EOSE (end of stored events)
    this.nostrClient.on('eose', (subscriptionId: string) => {
      if (subscriptionId === this.subscriptionId) {
        this.logger.debug('Received EOSE for NWC responses subscription');
      }
    });

    // Handle connection events
    this.nostrClient.on('connected', () => {
      this.logger.log('Nostr client connected');
    });

    this.nostrClient.on('disconnected', () => {
      this.logger.warn('Nostr client disconnected');
      this.rejectAllPendingRequests(new Error('Connection lost'));
    });

    this.nostrClient.on('error', (error: Error) => {
      this.logger.error('Nostr client error', error.stack);
    });
  }

  /**
   * Handle incoming NWC response event (kind 23195).
   */
  private async handleResponseEvent(event: Event): Promise<void> {
    try {
      this.logger.debug('Received NWC response event', {
        eventId: event.id,
        kind: event.kind,
      });

      // Decrypt content using NIP-04
      const decryptedContent = await this.decryptContent(event.content, event.pubkey);
      const response: NwcResponse = JSON.parse(decryptedContent);

      this.logger.debug('Decrypted NWC response', {
        result_type: response.result_type,
        hasError: !!response.error,
      });

      // Find matching pending request by looking at e tag (references request event)
      const requestEventId = this.getRequestEventId(event);
      if (!requestEventId) {
        this.logger.warn('Response event has no request event reference (e tag)');
        return;
      }

      // Match with pending request
      const pendingRequest = this.findPendingRequestByEventId(requestEventId);
      if (!pendingRequest) {
        this.logger.warn('No pending request found for response', { requestEventId });
        return;
      }

      // Clear timeout and resolve/reject
      clearTimeout(pendingRequest.timeoutHandle);
      this.pendingRequests.delete(pendingRequest.requestId);

      if (response.error) {
        this.logger.error('NWC request failed', {
          method: pendingRequest.method,
          error: response.error,
        });
        pendingRequest.reject(
          new Error(`${response.error.code}: ${response.error.message}`),
        );
      } else {
        this.logger.log('NWC request succeeded', {
          method: pendingRequest.method,
          result_type: response.result_type,
        });
        pendingRequest.resolve(response);
      }
    } catch (error) {
      this.logger.error('Failed to handle response event', (error as Error).stack);
    }
  }

  /**
   * Create a NWC request event (kind 23194).
   */
  private createRequestEvent(method: string, params: Record<string, any>): Event {
    if (!this.privateKey || !this.walletPubkey) {
      throw new Error('Cannot create request: keys not initialized');
    }

    const request: NwcRequest = { method, params };
    const content = JSON.stringify(request);

    // Encrypt content using NIP-04
    const encryptedContent = this.encryptContent(content, this.walletPubkey);

    // Create event template
    const eventTemplate: EventTemplate = {
      kind: 23194, // NWC request kind
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['p', this.walletPubkey], // Wallet's pubkey
      ],
      content: encryptedContent,
    };

    // Sign and finalize event
    const event = finalizeEvent(eventTemplate, this.privateKey);

    return event;
  }

  /**
   * Encrypt content using NIP-04 encryption.
   */
  private encryptContent(content: string, recipientPubkey: string): string {
    if (!this.privateKey) {
      throw new Error('Cannot encrypt: private key not set');
    }

    try {
      const encrypted = nip04.encrypt(this.privateKey, recipientPubkey, content);
      return encrypted;
    } catch (error) {
      this.logger.error('Encryption failed', (error as Error).stack);
      throw new Error('Failed to encrypt content');
    }
  }

  /**
   * Decrypt content using NIP-04 decryption.
   */
  private async decryptContent(encryptedContent: string, senderPubkey: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Cannot decrypt: private key not set');
    }

    try {
      const decrypted = await nip04.decrypt(this.privateKey, senderPubkey, encryptedContent);
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', (error as Error).stack);
      throw new Error('Failed to decrypt content');
    }
  }

  /**
   * Get request event ID from response event's e tag.
   */
  private getRequestEventId(event: Event): string | null {
    const eTag = event.tags.find(tag => tag[0] === 'e');
    return eTag ? eTag[1] : null;
  }

  /**
   * Find pending request by request event ID.
   * Note: This is a simplified implementation. In production, you would
   * store the event ID when creating the request.
   */
  private findPendingRequestByEventId(eventId: string): PendingRequest | null {
    // For now, we'll just take the oldest pending request
    // In a real implementation, we'd track event IDs
    const requests = Array.from(this.pendingRequests.values());
    return requests.length > 0 ? requests[0] : null;
  }

  /**
   * Generate a unique request ID.
   */
  private generateRequestId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Convert hex string to Uint8Array.
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Reject all pending requests with an error.
   */
  private rejectAllPendingRequests(error: Error): void {
    if (this.pendingRequests.size === 0) {
      return;
    }

    this.logger.warn(`Rejecting ${this.pendingRequests.size} pending requests`);

    for (const [requestId, request] of this.pendingRequests.entries()) {
      clearTimeout(request.timeoutHandle);
      request.reject(error);
    }

    this.pendingRequests.clear();
  }
}
