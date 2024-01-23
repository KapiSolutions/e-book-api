import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import {
  StripeModule as StripeGloveModule,
  StripeModuleConfig,
} from '@golevelup/nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  providers: [StripeService],
})
export class StripeModule {}
