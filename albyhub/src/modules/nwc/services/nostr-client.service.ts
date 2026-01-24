import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { verifyEvent } from 'nostr-tools';
import type { Event } from 'nostr-tools';

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export interface NostrSubscription {
  id: string;
  filters: any[];
}

/**
 * Nostr WebSocket client for connecting to NWC relays.
 * Manages persistent connection with auto-reconnect and heartbeat.
 */
@Injectable()
export class NostrClientService extends EventEmitter implements OnModuleDestroy {
  private readonly logger = new Logger(NostrClientService.name);
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private readonly maxReconnectDelay = 30000; // 30 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly heartbeatIntervalMs = 30000; // 30 seconds
  private relayUrl: string | null = null;
  private isShuttingDown = false;
  private subscriptions = new Map<string, NostrSubscription>();
  private pendingMessages: any[] = [];
  private connectionStartTime: number | null = null;

  constructor() {
    super();
  }

  /**
   * Connect to a Nostr relay via WebSocket.
   * Returns a promise that resolves when connected or rejects on timeout/error.
   */
  async connect(relayUrl: string, timeoutMs = 5000): Promise<void> {
    if (this.isShuttingDown) {
      throw new Error('Cannot connect: service is shutting down');
    }

    if (this.status === ConnectionStatus.CONNECTED && this.relayUrl === relayUrl) {
      this.logger.debug('Already connected to relay');
      return;
    }

    // Close existing connection if any
    if (this.ws) {
      await this.disconnect();
    }

    this.relayUrl = relayUrl;
    this.status = ConnectionStatus.CONNECTING;
    this.connectionStartTime = Date.now();

    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        const duration = Date.now() - (this.connectionStartTime || Date.now());
        this.logger.error(`Connection timeout after ${duration}ms`);
        this.handleConnectionError(new Error('Connection timeout'));
        reject(new Error(`Failed to connect to relay within ${timeoutMs}ms`));
      }, timeoutMs);

      try {
        this.ws = new WebSocket(relayUrl);

        this.ws.on('open', () => {
          clearTimeout(timeoutHandle);
          const duration = Date.now() - (this.connectionStartTime || Date.now());
          this.logger.log(`Connected to relay ${relayUrl} in ${duration}ms`);
          this.handleConnectionOpen();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('error', (error: Error) => {
          clearTimeout(timeoutHandle);
          this.logger.error('WebSocket error', error.stack);
          this.handleConnectionError(error);
          reject(error);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          clearTimeout(timeoutHandle);
          this.logger.warn(`WebSocket closed: code=${code}, reason=${reason.toString()}`);
          this.handleConnectionClose();
        });

        this.ws.on('ping', () => {
          this.logger.debug('Received ping from relay');
        });

        this.ws.on('pong', () => {
          this.logger.debug('Received pong from relay');
        });
      } catch (error) {
        clearTimeout(timeoutHandle);
        this.logger.error('Failed to create WebSocket connection', (error as Error).stack);
        this.handleConnectionError(error as Error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the relay and clean up resources.
   */
  async disconnect(): Promise<void> {
    this.logger.log('Disconnecting from relay...');
    this.isShuttingDown = true;

    // Clear timers
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Close WebSocket
    if (this.ws) {
      return new Promise<void>((resolve) => {
        if (!this.ws) {
          resolve();
          return;
        }

        const closeTimeout = setTimeout(() => {
          this.logger.warn('WebSocket close timeout, forcing termination');
          this.ws?.terminate();
          this.ws = null;
          this.status = ConnectionStatus.DISCONNECTED;
          resolve();
        }, 5000);

        this.ws.once('close', () => {
          clearTimeout(closeTimeout);
          this.ws = null;
          this.status = ConnectionStatus.DISCONNECTED;
          this.logger.log('WebSocket closed successfully');
          resolve();
        });

        this.ws.close(1000, 'Normal closure');
      });
    }

    this.status = ConnectionStatus.DISCONNECTED;
  }

  /**
   * Subscribe to events matching the given filters.
   * Returns the subscription ID.
   */
  subscribe(subscriptionId: string, filters: any[]): void {
    if (this.status !== ConnectionStatus.CONNECTED) {
      throw new Error('Cannot subscribe: not connected to relay');
    }

    this.logger.log(`Subscribing with ID ${subscriptionId}`, { filters });

    const subscription: NostrSubscription = {
      id: subscriptionId,
      filters,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Send REQ message to relay
    const reqMessage = ['REQ', subscriptionId, ...filters];
    this.send(reqMessage);
  }

  /**
   * Unsubscribe from events.
   */
  unsubscribe(subscriptionId: string): void {
    if (!this.subscriptions.has(subscriptionId)) {
      this.logger.warn(`Subscription ${subscriptionId} not found`);
      return;
    }

    this.logger.log(`Unsubscribing from ${subscriptionId}`);
    this.subscriptions.delete(subscriptionId);

    if (this.status === ConnectionStatus.CONNECTED) {
      const closeMessage = ['CLOSE', subscriptionId];
      this.send(closeMessage);
    }
  }

  /**
   * Publish a Nostr event to the relay.
   */
  publish(event: Event): void {
    if (this.status !== ConnectionStatus.CONNECTED) {
      throw new Error('Cannot publish: not connected to relay');
    }

    // Verify event signature before publishing
    if (!verifyEvent(event)) {
      throw new Error('Invalid event signature');
    }

    this.logger.debug(`Publishing event kind ${event.kind}`, {
      eventId: event.id,
      pubkey: event.pubkey.substring(0, 8) + '...',
    });

    const eventMessage = ['EVENT', event];
    this.send(eventMessage);
  }

  /**
   * Get current connection status.
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Check if connected to relay.
   */
  isConnected(): boolean {
    return this.status === ConnectionStatus.CONNECTED;
  }

  /**
   * NestJS lifecycle hook: cleanup on module destroy.
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  /**
   * Send a message to the relay.
   */
  private send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.logger.warn('Cannot send message: WebSocket not open', { message });
      this.pendingMessages.push(message);
      return;
    }

    try {
      const json = JSON.stringify(message);
      this.ws.send(json);
      this.logger.debug('Sent message to relay', { messageType: message[0] });
    } catch (error) {
      this.logger.error('Failed to send message', (error as Error).stack);
      throw error;
    }
  }

  /**
   * Handle WebSocket connection open event.
   */
  private handleConnectionOpen(): void {
    this.status = ConnectionStatus.CONNECTED;
    this.reconnectAttempts = 0;
    this.emit('connected');

    // Start heartbeat
    this.startHeartbeat();

    // Re-subscribe to all subscriptions
    for (const [subId, sub] of this.subscriptions.entries()) {
      this.logger.log(`Re-subscribing to ${subId}`);
      const reqMessage = ['REQ', subId, ...sub.filters];
      this.send(reqMessage);
    }

    // Send pending messages
    if (this.pendingMessages.length > 0) {
      this.logger.log(`Sending ${this.pendingMessages.length} pending messages`);
      for (const message of this.pendingMessages) {
        this.send(message);
      }
      this.pendingMessages = [];
    }
  }

  /**
   * Handle WebSocket connection close event.
   */
  private handleConnectionClose(): void {
    this.status = ConnectionStatus.DISCONNECTED;
    this.stopHeartbeat();
    this.emit('disconnected');

    // Attempt reconnection if not shutting down
    if (!this.isShuttingDown && this.relayUrl) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket connection error event.
   */
  private handleConnectionError(error: Error): void {
    this.status = ConnectionStatus.ERROR;
    this.stopHeartbeat();
    this.emit('error', error);

    // Attempt reconnection if not shutting down
    if (!this.isShuttingDown && this.relayUrl) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming messages from the relay.
   */
  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      if (!Array.isArray(message) || message.length === 0) {
        this.logger.warn('Received invalid message format', { message });
        return;
      }

      const [type, ...rest] = message;

      switch (type) {
        case 'EVENT':
          this.handleEventMessage(rest);
          break;
        case 'EOSE':
          this.handleEoseMessage(rest);
          break;
        case 'OK':
          this.handleOkMessage(rest);
          break;
        case 'NOTICE':
          this.handleNoticeMessage(rest);
          break;
        default:
          this.logger.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      this.logger.error('Failed to parse message', (error as Error).stack);
    }
  }

  /**
   * Handle EVENT message from relay.
   */
  private handleEventMessage(rest: any[]): void {
    if (rest.length < 2) {
      this.logger.warn('Invalid EVENT message format');
      return;
    }

    const [subscriptionId, event] = rest;

    // Verify event signature
    if (!verifyEvent(event)) {
      this.logger.warn('Received event with invalid signature', {
        eventId: event.id,
        subscriptionId,
      });
      return;
    }

    this.logger.debug(`Received event for subscription ${subscriptionId}`, {
      kind: event.kind,
      eventId: event.id,
    });

    this.emit('event', subscriptionId, event);
  }

  /**
   * Handle EOSE (End of Stored Events) message from relay.
   */
  private handleEoseMessage(rest: any[]): void {
    if (rest.length < 1) {
      this.logger.warn('Invalid EOSE message format');
      return;
    }

    const [subscriptionId] = rest;
    this.logger.debug(`End of stored events for subscription ${subscriptionId}`);
    this.emit('eose', subscriptionId);
  }

  /**
   * Handle OK message from relay (event acceptance/rejection).
   */
  private handleOkMessage(rest: any[]): void {
    if (rest.length < 3) {
      this.logger.warn('Invalid OK message format');
      return;
    }

    const [eventId, accepted, message] = rest;

    if (accepted) {
      this.logger.debug(`Event ${eventId} accepted by relay`);
      this.emit('ok', eventId, true, message);
    } else {
      this.logger.warn(`Event ${eventId} rejected by relay: ${message}`);
      this.emit('ok', eventId, false, message);
    }
  }

  /**
   * Handle NOTICE message from relay.
   */
  private handleNoticeMessage(rest: any[]): void {
    if (rest.length < 1) {
      this.logger.warn('Invalid NOTICE message format');
      return;
    }

    const [message] = rest;
    this.logger.log(`Notice from relay: ${message}`);
    this.emit('notice', message);
  }

  /**
   * Schedule reconnection with exponential backoff.
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      return; // Already scheduled
    }

    // Calculate backoff delay: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const baseDelay = 1000;
    const delay = Math.min(
      baseDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay,
    );

    this.reconnectAttempts++;
    this.logger.log(
      `Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.attemptReconnect();
    }, delay);
  }

  /**
   * Attempt to reconnect to the relay.
   */
  private async attemptReconnect(): Promise<void> {
    if (this.isShuttingDown || !this.relayUrl) {
      return;
    }

    this.logger.log(`Attempting to reconnect to ${this.relayUrl}...`);

    try {
      await this.connect(this.relayUrl);
      this.logger.log('Reconnection successful');
    } catch (error) {
      this.logger.error('Reconnection failed', (error as Error).message);
      // scheduleReconnect will be called by handleConnectionError
    }
  }

  /**
   * Start heartbeat/ping mechanism to keep connection alive.
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing interval

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.logger.debug('Sending ping to relay');
        this.ws.ping();
      }
    }, this.heartbeatIntervalMs);

    this.logger.debug(`Heartbeat started (interval: ${this.heartbeatIntervalMs}ms)`);
  }

  /**
   * Stop heartbeat mechanism.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      this.logger.debug('Heartbeat stopped');
    }
  }
}
