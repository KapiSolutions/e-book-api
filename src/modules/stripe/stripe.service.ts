import { Injectable } from '@nestjs/common';
import {
  InjectStripeClient,
  StripeWebhookHandler,
} from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StripeService {
  constructor(@InjectStripeClient() private stripe: Stripe) {}

  @StripeWebhookHandler('checkout.session.completed')
  async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Checkout.Session;
    const order: CreateOrderDto = {
      id: uuidv4(),
      client: {
        name: dataObject?.customer_details?.name as string,
        email: dataObject?.customer_details?.email as string,
      },
      prodName: dataObject?.metadata?.prodName,
      paymentIntent: dataObject?.payment_intent as string,
      amountTotal: dataObject?.amount_total as number,
      created: dataObject?.created,
    };
    console.log('✅ checkout.session.completed!', order);
  }
}
