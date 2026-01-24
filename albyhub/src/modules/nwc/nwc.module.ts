import { Module } from '@nestjs/common';
import { NostrClientService } from './services/nostr-client.service';
import { NwcConnectionService } from './services/nwc-connection.service';
import { NwcWalletService } from './services/nwc-wallet.service';
import { ConfigModule as AppConfigModule } from '@config/config.module';
import { LoggerService } from '@common/logger/logger.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    NostrClientService,
    NwcConnectionService,
    NwcWalletService,
    LoggerService,
  ],
  exports: [
    NostrClientService,
    NwcConnectionService,
    NwcWalletService,
  ],
})
export class NwcModule {}
