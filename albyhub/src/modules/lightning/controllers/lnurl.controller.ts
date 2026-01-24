import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('.well-known/lnurlp')
export class LnurlController {
  constructor(private readonly configService: ConfigService) {}

  @Get('pay')
  getPayMetadata() {
    const minSendable = this.configService.get<number>('MIN_SENDABLE', 1000);
    const maxSendable = this.configService.get<number>(
      'MAX_SENDABLE',
      100000000,
    );
    const commentAllowed = this.configService.get<number>(
      'COMMENT_ALLOWED',
      280,
    );
    const callbackUrl = this.configService.get<string>(
      'LNURL_CALLBACK_URL',
      'https://albyhub.brianstoker.com/lnurl/callback',
    );

    // LUD-16 compliant metadata format
    const metadata = JSON.stringify([
      ['text/plain', 'Pay to Brian Stoker'],
      ['text/identifier', 'pay@brianstoker.com'],
    ]);

    return {
      callback: callbackUrl,
      minSendable,
      maxSendable,
      metadata,
      tag: 'payRequest',
      commentAllowed,
    };
  }
}
