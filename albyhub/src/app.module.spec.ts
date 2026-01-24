// Set environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.ALBY_HUB_URL = 'https://api.getalby.com';
process.env.ALBY_HUB_CLIENT_ID = 'test_client_id';
process.env.ALBY_HUB_CLIENT_SECRET = 'test_client_secret';

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';

describe('AppModule', () => {
  describe('Test-1.1.a: AppModule bootstraps successfully with valid configuration', () => {
    it('should compile the module with valid environment variables', async () => {

      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      expect(module).toBeDefined();
      expect(module.get(ConfigModule)).toBeDefined();
    });

    it('should load configuration from environment', async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      const configModule = module.get(ConfigModule);
      expect(configModule).toBeDefined();
    });
  });
});
