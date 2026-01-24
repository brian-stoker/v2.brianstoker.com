import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export interface AppSecrets {
  voltage: {
    apiKey: string;
    macaroon: string;
    connectionUrl: string;
  };
  nostr: {
    privateKey: string;
    publicKey: string;
    relayUrl: string;
  };
}

interface CachedSecret {
  value: AppSecrets;
  expiresAt: number;
}

@Injectable()
export class SecretsService implements OnModuleInit {
  private readonly logger = new Logger(SecretsService.name);
  private readonly client: SecretsManagerClient;
  private cache: CachedSecret | null = null;
  private readonly cacheTTL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly maxRetries = 3;
  private readonly baseBackoffMs = 100;

  constructor() {
    // Initialize AWS Secrets Manager client
    // In Lambda, credentials are automatically provided via IAM role
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async onModuleInit() {
    const startTime = Date.now();
    this.logger.log('Loading secrets from AWS Secrets Manager...');

    try {
      await this.getSecrets();
      const duration = Date.now() - startTime;
      this.logger.log(`Secrets loaded successfully in ${duration}ms`);
    } catch (error) {
      this.logger.error('Failed to load secrets on startup', error);
      throw error;
    }
  }

  async getSecrets(): Promise<AppSecrets> {
    // Check cache first
    if (this.cache && this.cache.expiresAt > Date.now()) {
      this.logger.debug('Returning cached secrets');
      return this.cache.value;
    }

    this.logger.debug('Cache miss or expired, fetching from Secrets Manager');

    // Fetch from AWS Secrets Manager with retry logic
    const secrets = await this.fetchSecretsWithRetry();

    // Cache the secrets
    this.cache = {
      value: secrets,
      expiresAt: Date.now() + this.cacheTTL,
    };

    return secrets;
  }

  private async fetchSecretsWithRetry(): Promise<AppSecrets> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.fetchSecrets();
      } catch (error) {
        lastError = error as Error;

        // Only retry on transient errors (5xx)
        if (this.isRetryableError(error)) {
          const backoffMs = this.baseBackoffMs * Math.pow(2, attempt);
          this.logger.warn(
            `Secrets Manager request failed (attempt ${attempt + 1}/${this.maxRetries}). ` +
            `Retrying in ${backoffMs}ms...`,
            error,
          );
          await this.sleep(backoffMs);
        } else {
          // Non-retryable error, throw immediately
          throw error;
        }
      }
    }

    throw new Error(
      `Failed to fetch secrets after ${this.maxRetries} attempts: ${lastError?.message}`,
    );
  }

  private async fetchSecrets(): Promise<AppSecrets> {
    const secretName = process.env.SECRETS_MANAGER_NAME || 'albyhub/secrets';

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error(`Secret ${secretName} has no SecretString value`);
      }

      const secretData = JSON.parse(response.SecretString);

      // Validate all required secrets are present
      const missingSecrets: string[] = [];

      if (!secretData.VOLTAGE_API_KEY) missingSecrets.push('VOLTAGE_API_KEY');
      if (!secretData.VOLTAGE_MACAROON) missingSecrets.push('VOLTAGE_MACAROON');
      if (!secretData.VOLTAGE_CONNECTION_URL) missingSecrets.push('VOLTAGE_CONNECTION_URL');
      if (!secretData.NOSTR_PRIVATE_KEY) missingSecrets.push('NOSTR_PRIVATE_KEY');
      if (!secretData.NOSTR_PUBLIC_KEY) missingSecrets.push('NOSTR_PUBLIC_KEY');
      if (!secretData.NWC_RELAY_URL) missingSecrets.push('NWC_RELAY_URL');

      if (missingSecrets.length > 0) {
        const missingError = new Error(
          `Missing required secrets in ${secretName}: ${missingSecrets.join(', ')}`,
        );
        missingError.name = 'MissingSecretsError';
        throw missingError;
      }

      return {
        voltage: {
          apiKey: secretData.VOLTAGE_API_KEY,
          macaroon: secretData.VOLTAGE_MACAROON,
          connectionUrl: secretData.VOLTAGE_CONNECTION_URL,
        },
        nostr: {
          privateKey: secretData.NOSTR_PRIVATE_KEY,
          publicKey: secretData.NOSTR_PUBLIC_KEY,
          relayUrl: secretData.NWC_RELAY_URL,
        },
      };
    } catch (error: any) {
      // Don't sanitize missing secrets errors - they're already safe
      if (error.name === 'MissingSecretsError') {
        throw error;
      }

      // Ensure error messages don't leak secret values
      const safeError = this.sanitizeError(error, secretName);
      throw safeError;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on 5xx errors or network issues
    if (error.$metadata?.httpStatusCode >= 500) {
      return true;
    }

    // Retry on network/connection errors
    const retryableErrorCodes = [
      'NetworkingError',
      'TimeoutError',
      'ServiceUnavailable',
      'InternalServiceError',
      'Throttling',
      'ThrottlingException',
      'RequestTimeout',
    ];

    return retryableErrorCodes.includes(error.name || error.code);
  }

  private sanitizeError(error: any, secretName: string): Error {
    // Create a safe error message that doesn't leak secret values
    const errorType = error.name || error.code || 'Unknown';
    let message = `Failed to fetch secret "${secretName}": ${errorType}`;

    // Add additional context based on error type
    if (error.name === 'ResourceNotFoundException') {
      message = `Secret "${secretName}" not found in AWS Secrets Manager`;
    } else if (error.name === 'AccessDeniedException') {
      message = `Access denied to secret "${secretName}". Check Lambda IAM permissions.`;
    } else if (this.isRetryableError(error)) {
      message = `AWS Secrets Manager temporarily unavailable (${errorType})`;
    }

    const safeError = new Error(message);
    safeError.name = errorType;

    // Preserve stack trace in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      safeError.stack = error.stack;
    }

    return safeError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear cache (useful for testing)
  clearCache(): void {
    this.cache = null;
    this.logger.debug('Secrets cache cleared');
  }
}
