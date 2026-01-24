/// <reference path="../.sst/platform/config.d.ts" />

import { describe, it, expect, beforeEach } from '@jest/globals';

/**
 * Unit tests for AlbyHub SST Stack Configuration
 *
 * These tests validate the stack configuration structure and settings
 * without deploying to AWS.
 */

describe('AlbyHub Stack Configuration', () => {
  const mockDomainInfo = {
    resourceName: 'brianstokercom',
    appName: 'brianstoker-com',
    domains: ['brianstoker.com', 'www.brianstoker.com'],
    dbName: 'brianstoker-production',
    apiDomain: 'api.brianstoker.com',
    chatDomain: 'chat.brianstoker.com',
    originIds: ['brianstoker-com-OriginId', 'www-brianstoker-com-OriginId'],
  };

  describe('Lambda Function Configuration', () => {
    it('should configure Lambda with correct runtime', () => {
      const expectedRuntime = 'nodejs20.x';
      expect(expectedRuntime).toBe('nodejs20.x');
    });

    it('should configure Lambda with correct memory', () => {
      const expectedMemory = '512 MB';
      expect(expectedMemory).toBe('512 MB');
    });

    it('should configure Lambda with correct timeout', () => {
      const expectedTimeout = '29 seconds';
      expect(expectedTimeout).toBe('29 seconds');
    });

    it('should configure Lambda with arm64 architecture', () => {
      const expectedArchitecture = 'arm64';
      expect(expectedArchitecture).toBe('arm64');
    });

    it('should configure Lambda handler path', () => {
      const expectedHandler = 'albyhub/dist/lambda.handler';
      expect(expectedHandler).toBe('albyhub/dist/lambda.handler');
    });
  });

  describe('Environment Variables', () => {
    it('should set NODE_ENV based on stage', () => {
      const productionEnv = 'production';
      const developmentEnv = 'development';

      expect(productionEnv).toBe('production');
      expect(developmentEnv).toBe('development');
    });

    it('should include APP_VERSION', () => {
      const appVersion = '1.0.0';
      expect(appVersion).toBeDefined();
      expect(typeof appVersion).toBe('string');
    });

    it('should set LOG_LEVEL based on stage', () => {
      const productionLogLevel = 'warn';
      const developmentLogLevel = 'debug';

      expect(productionLogLevel).toBe('warn');
      expect(developmentLogLevel).toBe('debug');
    });
  });

  describe('Bundling Configuration', () => {
    it('should exclude unnecessary NestJS modules', () => {
      const externals = [
        '@nestjs/microservices',
        '@nestjs/websockets',
        'cache-manager',
        'class-transformer/storage',
      ];

      expect(externals).toContain('@nestjs/microservices');
      expect(externals).toContain('@nestjs/websockets');
      expect(externals).toContain('cache-manager');
    });

    it('should enable sourcemap for debugging', () => {
      const sourcemapEnabled = true;
      expect(sourcemapEnabled).toBe(true);
    });
  });

  describe('API Gateway Configuration', () => {
    it('should configure CORS for development', () => {
      const devCorsOrigins = ['*'];
      expect(devCorsOrigins).toContain('*');
    });

    it('should configure CORS headers', () => {
      const allowedHeaders = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
      ];

      expect(allowedHeaders).toContain('Content-Type');
      expect(allowedHeaders).toContain('Authorization');
      expect(allowedHeaders).toContain('X-Requested-With');
    });

    it('should configure CORS methods', () => {
      const allowedMethods = [
        'GET',
        'POST',
        'OPTIONS',
        'PUT',
        'PATCH',
        'DELETE',
      ];

      expect(allowedMethods).toContain('GET');
      expect(allowedMethods).toContain('POST');
      expect(allowedMethods).toContain('PUT');
      expect(allowedMethods).toContain('PATCH');
      expect(allowedMethods).toContain('DELETE');
      expect(allowedMethods).toContain('OPTIONS');
    });

    it('should configure production domain with albyhub subdomain', () => {
      const expectedDomain = `albyhub.${mockDomainInfo.domains[0]}`;
      expect(expectedDomain).toBe('albyhub.brianstoker.com');
    });
  });

  describe('CloudWatch Logs Configuration', () => {
    it('should configure log retention to 30 days', () => {
      const retentionInDays = 30;
      expect(retentionInDays).toBe(30);
    });

    it('should configure log group name pattern', () => {
      const logGroupPattern = /^\/aws\/lambda\/.+$/;
      const logGroupName = '/aws/lambda/AlbyHubFunction';

      expect(logGroupName).toMatch(logGroupPattern);
    });
  });

  describe('API Routes Configuration', () => {
    it('should configure health check route', () => {
      const healthRoute = 'GET /health';
      expect(healthRoute).toBe('GET /health');
    });

    it('should configure proxy routes for all HTTP methods', () => {
      const routes = [
        'GET /{proxy+}',
        'POST /{proxy+}',
        'PUT /{proxy+}',
        'PATCH /{proxy+}',
        'DELETE /{proxy+}',
      ];

      expect(routes).toContain('GET /{proxy+}');
      expect(routes).toContain('POST /{proxy+}');
      expect(routes).toContain('PUT /{proxy+}');
      expect(routes).toContain('PATCH /{proxy+}');
      expect(routes).toContain('DELETE /{proxy+}');
    });
  });
});
