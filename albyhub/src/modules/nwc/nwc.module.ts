import { Module } from '@nestjs/common';
import { NostrClientService } from './services/nostr-client.service';
import { NwcConnectionService } from './services/nwc-connection.service';
import { ConfigModule as AppConfigModule } from '@config/config.module';
import { LoggerService } from '@common/logger/logger.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    NostrClientService,
    NwcConnectionService,
    LoggerService,
  ],
  exports: [
    NostrClientService,
    NwcConnectionService,
  ],
})
export class NwcModule {}
