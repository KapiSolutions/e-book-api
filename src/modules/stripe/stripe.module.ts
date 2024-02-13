import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import {
  StripeModule as StripeGloveModule,
  StripeModuleConfig,
} from '@golevelup/nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudStorage } from 'src/providers/cloudStorage';
import { ModifyPDF } from 'src/providers/modifyPDF';
import { EmailSender } from 'src/providers/emailSender';

@Module({
  imports: [
    StripeGloveModule.forRootAsync(StripeGloveModule, {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('STRIPE_CONFIG') as
          | StripeModuleConfig
          | Promise<StripeModuleConfig>,
      inject: [ConfigService],
    }),
  ],
  controllers: [StripeController],
  providers: [StripeService, CloudStorage, ModifyPDF, EmailSender],
})
export class StripeModule {}
