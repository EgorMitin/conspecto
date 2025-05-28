import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // hjyh lehd xlef ldyr
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${token}`;
    
    try {
      await this.transporter.sendMail({
        from: `"Conspecto" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Verify your email for Conspecto',
        html: `
          <div>
            <h1>Welcome to Conspecto!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #FFBF00; color: #000; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}`, error);
      return false;
    }
  }
}

export default new EmailService();