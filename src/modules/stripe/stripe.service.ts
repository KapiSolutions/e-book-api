import { Injectable } from '@nestjs/common';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailSender } from 'src/providers/emailSender';
import { SendMailOptions } from 'nodemailer';

@Injectable()
export class StripeService {
  @StripeWebhookHandler('checkout.session.completed')
  async handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Checkout.Session;
    if (dataObject) {
      const order: CreateOrderDto = {
        id: uuidv4(),
        client: {
          name: dataObject.customer_details?.name as string,
          email: dataObject.customer_details?.email as string,
        },
        prodName: dataObject.metadata?.prodName,
        paymentIntent: dataObject.payment_intent as string,
        amountTotal: dataObject.amount_total as number,
        created: dataObject.created,
      };
      console.log('✅ checkout.session.completed!', order);

      // Send email to the client
      const emailSender = new EmailSender();
      const emailOptions: SendMailOptions = {
        from: {
          name: 'Test name',
          address: process.env.GOOGLE_EMAIL || '',
        },
        to: order?.client?.email,
        subject: 'Test Email',
        text: `Hello ${order?.client?.name}, this is a test email.`,
      };
      await emailSender.sendEmail(emailOptions);
    }
  }
}
