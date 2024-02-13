import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailSender {
  private transporter: nodemailer.Transporter | null = null;
  private OAuth2 = google.auth.OAuth2;

  constructor(private readonly configService: ConfigService) {}

  private async initNodeMailer(): Promise<void> {
    try {
      const oauth2Client = new this.OAuth2(
        this.configService.get<string>('GOOGLE_CLIENT_ID'),
        this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        'https://developers.google.com/oauthplayground',
      );

      oauth2Client.setCredentials({
        refresh_token: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
      });

      const accessToken = await new Promise<string>((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            reject('Failed to create access token.');
          }
          resolve(token as string);
        });
      });

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.configService.get<string>('GOOGLE_EMAIL'),
          accessToken,
          clientId: this.configService.get<string>('GOOGLE_CLIENT_ID'),
          clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
          refreshToken: this.configService.get<string>('GOOGLE_REFRESH_TOKEN'),
        },
        tls: { rejectUnauthorized: false },
      });
    } catch (error) {
      console.error('Error initializing nodemailer:', error.message || error);
      throw new Error('Failed to initialize nodemailer');
    }
  }

  async sendEmail(options: nodemailer.SendMailOptions): Promise<void> {
    if (!this.transporter) {
      await this.initNodeMailer();
    }

    try {
      if (!this.transporter) {
        throw new Error('Nodemailer not initialized');
      }
      await this.transporter.sendMail(options);
      console.log('✅ Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.message || error);
      throw new Error('Failed to send email');
    } finally {
      this.transporter?.close();
    }
  }
}
