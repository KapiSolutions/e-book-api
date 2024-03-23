import { Injectable } from '@nestjs/common';
import { EmailSender } from 'src/providers/emailSender';
import { SendMailOptions } from 'nodemailer';
import { CloudStorage } from 'src/providers/cloudStorage';
import { ModifyPDF } from 'src/providers/modifyPDF';
import { ConfigService } from '@nestjs/config';
import { Data } from './pdf.controller';
import { Order } from 'src/modules/stripe/entities/order.entity';

@Injectable()
export class PdfService {
  constructor(
    private readonly cloudStorage: CloudStorage,
    private readonly modifyPDF: ModifyPDF,
    private readonly emailSender: EmailSender,
    private readonly configService: ConfigService,
  ) {}

  async processPDF(data: Data) {
    console.log('⭐ E-book details:', data);
    // Get and modify specific ebook PDF
    const finalPDF = await this.getEbook(data);

    // Send e-book on the admin email address
    await this.sendEmail(data, finalPDF);
    console.log('✅ Processing complete!');

    return `Processing e-book completed! Version for: ${data.clientName}, email: ${data.clientEmail}. Please check your email.`;
  }

  private async getEbook(data: Data): Promise<Buffer> {
    try {
      const basePDF = await this.cloudStorage.downloadFile(
        'ebookoid',
        `${data.docName}/${data.docName}.pdf`,
      );
      const client = { name: data.clientName, email: data.clientEmail };

      const readyPDF = await this.modifyPDF.start(
        basePDF,
        data.coverPages || [0],
        client as Order['client'],
      );

      return readyPDF;
    } catch (error) {
      console.error('Error processing PDF:', error.message || error);
      throw new Error('Error processing PDF');
    }
  }

  private async sendEmail(data: Data, file: Buffer): Promise<void> {
    const emailAdmin = this.configService.get<string>('GOOGLE_EMAIL') as string;
    const message = `E-book jest gotowy(wersja dla: ${data.clientName} email: ${data.clientEmail}), możesz go znaleźć w załączniku.🧡`;
    const subject = `Wygenerowany E-book dla ${data.clientName}!`;
    const emailOptions: SendMailOptions = {
      from: {
        name: 'Pan Niezniszczalny',
        address: emailAdmin,
      },
      to: emailAdmin,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: data.finalDocName || 'e-book.pdf',
          content: file,
          encoding: 'base64',
        },
      ],
    };
    await this.emailSender.sendEmail(emailOptions);
  }
}
