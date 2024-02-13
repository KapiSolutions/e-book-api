import { Injectable } from '@nestjs/common';
import { StripeWebhookHandler } from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { EmailSender } from 'src/providers/emailSender';
import { SendMailOptions } from 'nodemailer';
import { CloudStorage } from 'src/providers/cloudStorage';
import { ModifyPDF } from 'src/providers/modifyPDF';
import { Order } from './entities/order.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  constructor(
    private readonly cloudStorage: CloudStorage,
    private readonly modifyPDF: ModifyPDF,
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
  ) {}

  @StripeWebhookHandler('checkout.session.completed')
  async handleEvent(event: Stripe.Event): Promise<void> {
    const {
      metadata,
      customer_details,
      custom_fields,
      payment_intent,
      amount_total,
      created,
    } = event.data.object as Stripe.Checkout.Session;

    if (event.data.object) {
      const coverPages = metadata?.coverPages
        ?.split(',')
        .map((str) => parseInt(str.trim(), 10));

      const order: CreateOrderDto = {
        id: uuidv4(),
        client: {
          name:
            customer_details?.name || (custom_fields[0].text?.value as string),
          email: customer_details?.email as string,
        },
        docName: metadata?.docName,
        finalDocName: metadata?.finalDocName,
        coverPages: coverPages,
        paymentIntent: payment_intent as string,
        amountTotal: amount_total as number,
        created: created,
      };
      console.log('⭐ Order details:', order);

      // Get and modify specific ebook PDF
      const finalPDF = await this.getEbook(order);

      // Send email to the client
      await this.sendEmail(order, finalPDF);
      console.log('✅ Processing complete!');
    }
  }

  private async getEbook(order: CreateOrderDto): Promise<Buffer> {
    try {
      const basePDF = await this.cloudStorage.downloadFile(
        'ebookoid',
        `${order.docName}/${order.docName}.pdf`,
      );

      return await this.modifyPDF.start(
        basePDF,
        order.coverPages || [0],
        order.client as Order['client'],
      );
    } catch (error) {
      console.error('Error processing PDF:', error.message || error);
      throw new Error('Error processing PDF');
    }
  }

  private async sendEmail(order: CreateOrderDto, file: Buffer): Promise<void> {
    const emailOptions: SendMailOptions = {
      from: {
        name: 'Pan Niezniszczalny',
        address: this.configService.get<string>('GOOGLE_EMAIL') as string,
      },
      to: order.client?.email,
      subject: 'Twój E-book!',
      text: `Cześć ${order?.client?.name}! Dziękuję bardzo za zamówienie. Twój e-book jest gotowy, możesz go znaleźć w załączniku. Miłej lektury 🧡`,
      attachments: [
        {
          filename: order.finalDocName || 'e-book.pdf',
          content: file,
          encoding: 'base64',
        },
      ],
    };
    await this.emailSender.sendEmail(emailOptions);
  }
}
