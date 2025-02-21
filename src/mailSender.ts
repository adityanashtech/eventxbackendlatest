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
                user: '',
                pass: '' 
            }
        });
    }

    async sendMail(to: string, subject: string, text: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '', 
                to,
                subject,
                text
            });
            console.log('Message sent: %s', info.messageId);
        } catch (error) {
            console.error('Error occurred while sending email:', error);
        }
    }
}
