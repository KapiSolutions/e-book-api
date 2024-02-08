import { Injectable } from '@nestjs/common';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailSender } from 'src/providers/emailSender';
import { SendMailOptions } from 'nodemailer';
import { CloudStorage } from 'src/providers/cloudStorage';
import { ModifyPDF } from 'src/providers/modifyPDF';

@Injectable()
export class StripeService {
  private pdf: Buffer;
  constructor(
    private readonly cloudStorage: CloudStorage,
    private readonly modifyPDF: ModifyPDF,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  async handleEvent(event: Stripe.Event): Promise<void> {
    const dataObject = event.data.object as Stripe.Checkout.Session;
    if (dataObject) {
      const coverPages = dataObject.metadata?.coverPages
        ?.split(',')
        .map((str) => parseInt(str.trim(), 10));

      const order: CreateOrderDto = {
        id: uuidv4(),
        client: {
          name:
            dataObject.customer_details?.name ||
            (dataObject.custom_fields[0].text?.value as string),
          email: dataObject.customer_details?.email as string,
        },
        prodName: dataObject.metadata?.prodName,
        finalDocName: dataObject.metadata?.finalDocName,
        coverPages: coverPages,
        paymentIntent: dataObject.payment_intent as string,
        amountTotal: dataObject.amount_total as number,
        created: dataObject.created,
      };
      console.log('✅ checkout.session.completed!', order);

      // Get and modify specific ebook PDF
      try {
        const basePDF = await this.cloudStorage.downloadFile(
          'ebookoid',
          `${order.prodName}/${order.prodName}.pdf` ||
            'first-ebook/first-ebook.pdf',
        );
        this.pdf = await this.modifyPDF.addWatermak(
          basePDF,
          order.coverPages || [0],
          order.client,
        );
      } catch (error) {
        console.error('Error processing PDF:', error.message);
        throw new Error('Error processing PDF');
      }

      // Send email to the client
      const emailSender = new EmailSender();
      const emailOptions: SendMailOptions = {
        from: {
          name: 'Pan Niezniszczalny',
          address: process.env.GOOGLE_EMAIL || '',
        },
        to: order.client?.email,
        subject: 'Twój E-book!',
        text: `Cześć ${order?.client?.name}! Dziękuję bardzo za zamówienie. Twój e-book jest gotowy, możesz go znaleźć w załączniku. Miłej lektury 🧡`,
        attachments: [
          {
            filename: order.finalDocName || 'e-book.pdf',
            content: this.pdf,
            encoding: 'base64',
          },
        ],
      };
      await emailSender.sendEmail(emailOptions);
      console.log('✅ Processing complete!');
    }
  }
}
