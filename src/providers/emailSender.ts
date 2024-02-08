import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

export class EmailSender {
  private transporter: nodemailer.Transporter | null = null;
  private OAuth2 = google.auth.OAuth2;

  private async initNodeMailer(): Promise<void> {
    try {
      const oauth2Client = new this.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground',
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
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
          user: process.env.GOOGLE_EMAIL,
          accessToken,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        },
        tls: { rejectUnauthorized: false },
      });
    } catch (err) {
      console.error('Error initializing nodemailer:', err);
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
    } catch (err) {
      console.error('Error sending email:', err);
      throw new Error('Failed to send email');
    } finally {
      this.transporter?.close();
    }
  }
}
