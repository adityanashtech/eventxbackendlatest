import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailSender {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // service: 'Outlook365',
      // host: 'smtp.office365.com',
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: 'no-reply@eventx.com',
        to,
        subject,
        html,
      });
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error occurred while sending email:', error);
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    // const resetLink = `eventx://reset-password?token=${token}`;
    const message = `
    <p>You requested to reset your password.
    <h2>Token: ${token}</h2>
    <p>If you didn’t request this, ignore this email.</p>
  `;

    await this.sendMail(email, 'Reset Your Password', message);
  }
}
