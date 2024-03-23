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
      await this.sendEmailToClient(order, finalPDF);
      // Send email to the admin
      await this.sendEmailToAdmin(order);
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

  private async sendEmailToClient(
    order: CreateOrderDto,
    file: Buffer,
  ): Promise<void> {
    const adminEmail = this.configService.get<string>('GOOGLE_EMAIL') as string;
    const subject = `Twój E-book jest gotowy! (id: ${order.paymentIntent})`;
    const message = `Cześć ${order?.client?.name}! Dziękuję bardzo za zamówienie. Twój e-book jest gotowy, możesz go znaleźć w załączniku. Miłej lektury 🧡`;
    const emailOptions: SendMailOptions = {
      from: {
        name: 'Pan Niezniszczalny',
        address: adminEmail,
      },
      to: order.client?.email,
      subject: subject,
      text: message,
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

  private async sendEmailToAdmin(order: CreateOrderDto): Promise<void> {
    const adminEmail = this.configService.get<string>('GOOGLE_EMAIL') as string;
    const notificationEmail = this.configService.get<string>(
      'NOTIFICATION_EMAIL',
    ) as string;
    const amount = order.amountTotal && (order.amountTotal / 100).toFixed(2);
    const subject = `E-book sprzedany! 🎉 (Kwota: ${amount} PLN, id: ${order.paymentIntent})`;

    const message = `Cześć! \n
    Właśnie ktoś kupił Twojego E-booka! 🎉 \n
    Zamówienie przebiegło pomyślnie. Oto szczegóły: \n
    - Klient: ${order.client?.name} (${order.client?.email})\n
    - E-book: ${order.finalDocName} \n
    - Kwota zamówienia: ${amount} PLN \n
    - ID zamówienia: ${order.paymentIntent} \n\n
    Gratulacje! 🧡`;

    const emailOptions: SendMailOptions = {
      from: {
        name: 'Pan Niezniszczalny',
        address: adminEmail,
      },
      to: notificationEmail,
      subject: subject,
      text: message,
    };
    await this.emailSender.sendEmail(emailOptions);
  }
}
